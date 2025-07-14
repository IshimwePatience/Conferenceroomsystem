package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.booking.BookingCreateDto;
import Room.ConferenceRoomMgtsys.dto.booking.BookingResponseDto;
import Room.ConferenceRoomMgtsys.dto.booking.BookingSearchDto;
import Room.ConferenceRoomMgtsys.enums.BookingStatus;
import Room.ConferenceRoomMgtsys.model.Booking;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.service.EmailService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public BookingService(BookingRepository bookingRepository,
            RoomRepository roomRepository,
            UserRepository userRepository,
            EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public BookingResponseDto createBooking(BookingCreateDto createDto, User user) {
        // Prevent booking in the past
        LocalDateTime now = LocalDateTime.now();
        if (createDto.getStartTime() == null || createDto.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }
        if (createDto.getStartTime().isBefore(now) || createDto.getEndTime().isBefore(now)) {
            throw new IllegalArgumentException("Cannot book a room for a past date or time.");
        }
        if (createDto.getEndTime().isBefore(createDto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        // Validate room exists
        Room room = roomRepository.findById(createDto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Check for direct conflicts only (no gap required)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                room,
                createDto.getStartTime(),
                createDto.getEndTime());

        if (!conflicts.isEmpty()) {
            Booking conflictingBooking = conflicts.get(0);
            // Check if the conflicting booking was made by the same user
            if (conflictingBooking.getUser().getId().equals(user.getId())) {
                throw new IllegalArgumentException("You have already booked this room for the selected time.");
            } else {
                throw new ConflictingBookingException(
                        conflictingBooking.getStartTime().toString(),
                        conflictingBooking.getEndTime().toString(),
                        conflictingBooking.getUser().getFirstName() + " " + conflictingBooking.getUser().getLastName(),
                        conflictingBooking.getUser().getEmail(),
                        conflictingBooking.getRoom().getOrganization().getName());
            }
        }

        // Create booking with PENDING status (approval needed)
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setStartTime(createDto.getStartTime());
        booking.setEndTime(createDto.getEndTime());
        booking.setPurpose(createDto.getPurpose());
        booking.setNotes(createDto.getNotes());
        booking.setAttendeeCount(createDto.getAttendeeCount());
        booking.setStatus(BookingStatus.PENDING); // Bookings require approval
        booking.setIsActive(true); // Explicitly set isActive to true for new bookings

        // Save and return booking DTO
        Booking savedBooking = bookingRepository.save(booking);
        logger.info("Booking created and saved: ID={}, Purpose={}, StartTime={}, EndTime={}, Status={}, IsActive={}",
                savedBooking.getId(), savedBooking.getPurpose(), savedBooking.getStartTime(), savedBooking.getEndTime(),
                savedBooking.getStatus(), savedBooking.getIsActive());

        // Email notifications
        // 1. Notify user
        emailService.sendSimpleEmail(user.getEmail(), "Booking Request Sent",
                "Your booking request has been sent and is pending approval.");
        // 2. Notify org admins
        List<User> orgAdmins = userRepository.findByOrganizationAndRole(room.getOrganization(), UserRole.ADMIN);
        for (User admin : orgAdmins) {
            emailService.sendSimpleEmail(admin.getEmail(), "Booking Pending Approval",
                    "A new booking is pending your approval for room: " + room.getName());
        }
        // 3. Notify system admins
        List<User> sysAdmins = userRepository
                .findByRole(UserRole.SYSTEM_ADMIN, org.springframework.data.domain.Pageable.unpaged()).getContent();
        for (User sysAdmin : sysAdmins) {
            emailService.sendSimpleEmail(sysAdmin.getEmail(), "Booking Pending Approval",
                    "A new booking is pending approval for room: " + room.getName());
        }

        return convertToDto(savedBooking);
    }

    @Transactional
    public BookingResponseDto cancelBooking(UUID bookingId, User user) {
        // Find booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Validate user owns the booking
        if (!booking.getUser().equals(user)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        // Check if booking is not already cancelled or completed
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("This booking cannot be cancelled");
        }

        // Set status to CANCELLED
        booking.setStatus(BookingStatus.CANCELLED);

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        return convertToDto(savedBooking);
    }

    @Transactional
    public BookingResponseDto updateBooking(UUID bookingId, BookingCreateDto updateDto, User user) {
        // Find booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // Validate user owns the booking
        if (!booking.getUser().equals(user)) {
            throw new IllegalArgumentException("You can only update your own bookings");
        }

        // Check if booking is not already cancelled or completed
        if (booking.getStatus() == BookingStatus.CANCELLED ||
                booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("This booking cannot be updated");
        }

        // Update booking details
        booking.setPurpose(updateDto.getPurpose());
        booking.setNotes(updateDto.getNotes());
        booking.setAttendeeCount(updateDto.getAttendeeCount());

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        return convertToDto(savedBooking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponseDto> searchBookings(BookingSearchDto searchDto, Pageable pageable) {
        // Get bookings based on search criteria
        Page<Booking> bookings = bookingRepository.searchByPurposeOrNotes(searchDto.getSearchTerm(), pageable);

        // Convert to DTOs
        return bookings.map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUpcomingBookingsByUser(User user, LocalDateTime currentTime) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByUser(user, currentTime);
        return bookings.stream()
                .filter(booking -> booking.getIsActive()) // Only return active bookings
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getUpcomingBookingsByRoom(Room room, LocalDateTime currentTime) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsByRoom(room, currentTime);
        return bookings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getTodaysBookingsByRoom(Room room, LocalDateTime date) {
        List<Booking> bookings = bookingRepository.findTodaysBookingsByRoom(room, date);
        return bookings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getPendingBookingsByOrganization(Organization organization) {
        List<Booking> bookings = bookingRepository.findPendingBookingsByOrganization(organization);
        return bookings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getAllUpcomingBookings(LocalDateTime currentTime) {
        List<Booking> bookings = bookingRepository.findUpcomingBookingsGlobal(currentTime);
        return bookings.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getBookingHistoryByUser(User user) {
        List<Booking> bookings = bookingRepository.findByUser(user);
        return bookings.stream()
                .filter(booking -> !booking.getIsActive() || booking.getStatus() == BookingStatus.COMPLETED)
                .map(this::convertToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getOngoingBookingsGlobal(LocalDateTime currentTime) {
        List<Booking> bookings = bookingRepository.findOngoingApprovedBookings(currentTime);
        return bookings.stream()
                .map(this::convertToDto)
                .toList();
    }

    private String calculateDuration(LocalDateTime startTime, LocalDateTime endTime) {
        long durationMinutes = java.time.temporal.ChronoUnit.MINUTES.between(startTime, endTime);
        return String.format("%dh %dm", durationMinutes / 60, durationMinutes % 60);
    }

    private BookingResponseDto convertToDto(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId()); // BaseResponseDto expects UUID

        logger.info("Converting booking to DTO: ID={}, Purpose={}, StartTime={}, EndTime={}, Status={}, IsActive={}",
                booking.getId(), booking.getPurpose(), booking.getStartTime(), booking.getEndTime(),
                booking.getStatus(), booking.getIsActive());

        // Set user details
        dto.setUserName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setUserEmail(booking.getUser().getEmail());

        // Set room details
        dto.setRoomId(booking.getRoom().getId());
        dto.setRoomName(booking.getRoom().getName());
        dto.setOrganizationName(booking.getRoom().getOrganization().getName());

        // Set organization IDs for frontend approval logic
        if (booking.getUser() != null && booking.getUser().getOrganization() != null) {
            dto.setOrganizationId(booking.getUser().getOrganization().getId());
        }
        if (booking.getRoom() != null && booking.getRoom().getOrganization() != null) {
            dto.setRoomOrganizationId(booking.getRoom().getOrganization().getId());
        }

        // Set booking details
        dto.setBookingDate(booking.getStartTime().toLocalDate().toString());
        dto.setStartTime(booking.getStartTime().toString());
        dto.setEndTime(booking.getEndTime().toString());
        dto.setDuration(calculateDuration(booking.getStartTime(), booking.getEndTime()));
        dto.setStatus(booking.getStatus().toString());
        dto.setPurpose(booking.getPurpose());
        dto.setNotes(booking.getNotes());
        dto.setAttendeeCount(booking.getAttendeeCount());
        dto.setIsActive(booking.getIsActive());

        // Set approval details if available
        if (booking.getApprovedBy() != null) {
            dto.setApprovedByName(booking.getApprovedBy().getFirstName() + " " + booking.getApprovedBy().getLastName());
            dto.setApprovedTime(booking.getApprovedAt().toString());
        }

        // Set rejection reason if available
        if (booking.getRejectionReason() != null) {
            dto.setRejectionReason(booking.getRejectionReason());
        }

        // Set recurring info
        dto.setRecurringInfo(booking.getIsRecurring() ? "Recurring" : "One-time meeting");

        return dto;
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDto> getAllBookingsForUserRole(User currentUser) {
        List<Booking> bookings;
        if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
            bookings = bookingRepository.findAll(); // Get all bookings for system admin
        } else if (currentUser.getRole() == UserRole.ADMIN) {
            if (currentUser.getOrganization() == null) {
                throw new RuntimeException("Admin is not associated with an organization.");
            }
            // Fetch all bookings for rooms owned by the admin's organization
            bookings = bookingRepository.findByRoom_Organization(currentUser.getOrganization());
        } else {
            bookings = bookingRepository.findByUser(currentUser); // Get only user's own bookings
        }
        // Deduplicate by booking ID
        return bookings.stream()
                .collect(java.util.stream.Collectors.toMap(Booking::getId, b -> b, (b1, b2) -> b1))
                .values().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveBooking(UUID bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (currentUser.getRole() != UserRole.SYSTEM_ADMIN &&
                !booking.getRoom().getOrganization().equals(currentUser.getOrganization())) {
            throw new IllegalArgumentException("You can only approve bookings in your own organization");
        }

        booking.setStatus(BookingStatus.APPROVED);
        bookingRepository.save(booking);
        // Notify user
        emailService.sendSimpleEmail(booking.getUser().getEmail(), "Booking Approved",
                "Your booking for room: " + booking.getRoom().getName() + " has been approved.");
    }

    @Transactional
    public void rejectBooking(UUID bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (currentUser.getRole() != UserRole.SYSTEM_ADMIN &&
                !booking.getRoom().getOrganization().equals(currentUser.getOrganization())) {
            throw new IllegalArgumentException("You can only reject bookings in your own organization");
        }

        booking.setStatus(BookingStatus.REJECTED);
        bookingRepository.save(booking);
        // Notify user
        emailService.sendSimpleEmail(booking.getUser().getEmail(), "Booking Rejected",
                "Your booking for room: " + booking.getRoom().getName() + " has been rejected.");
    }

    /**
     * Automatically reject all pending bookings whose start time has passed.
     * Runs every minute.
     */
    @Scheduled(fixedRate = 60000) // every 60 seconds
    public void autoRejectExpiredPendingBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredPending = bookingRepository.findByStatusAndStartTimeBefore(BookingStatus.PENDING, now);
        for (Booking booking : expiredPending) {
            booking.setStatus(BookingStatus.REJECTED);
            bookingRepository.save(booking);
            // Optionally, notify the user
            emailService.sendSimpleEmail(
                    booking.getUser().getEmail(),
                    "Booking Automatically Rejected",
                    "Your booking for room: " + booking.getRoom().getName()
                            + " was automatically rejected because it was not approved before the meeting start time.");
        }
    }
}

// Custom exception for booking conflicts
@ResponseStatus(HttpStatus.CONFLICT)
class ConflictingBookingException extends RuntimeException {
    public final String startTime;
    public final String endTime;
    public final String userName;
    public final String userEmail;
    public final String organizationName;

    public ConflictingBookingException(String startTime, String endTime, String userName, String userEmail,
            String organizationName) {
        super("Room is already booked from " + startTime + " to " + endTime);
        this.startTime = startTime;
        this.endTime = endTime;
        this.userName = userName;
        this.userEmail = userEmail;
        this.organizationName = organizationName;
    }
}
