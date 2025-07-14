// package Room.ConferenceRoomMgtsys.service;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Optional;
// import java.util.UUID;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// import Room.ConferenceRoomMgtsys.dto.room.RoomExtensionRequestDto;
// import Room.ConferenceRoomMgtsys.enums.RoomCommunicationStatus;
// import Room.ConferenceRoomMgtsys.model.Booking;
// import Room.ConferenceRoomMgtsys.model.RoomCommunication;
// import Room.ConferenceRoomMgtsys.model.User;
// import Room.ConferenceRoomMgtsys.repository.RoomCommunicationRepository;
// import Room.ConferenceRoomMgtsys.repository.BookingRepository;

// @Service
// public class RoomCommunicationService {
    
//     private final RoomCommunicationRepository roomCommunicationRepository;
//     private final BookingRepository bookingRepository;
    
//     public RoomCommunicationService(RoomCommunicationRepository roomCommunicationRepository,
//                                    BookingRepository bookingRepository) {
//         this.roomCommunicationRepository = roomCommunicationRepository;
//         this.bookingRepository = bookingRepository;
//     }
    
//     @Transactional
//     public RoomCommunication requestRoomExtension(RoomExtensionRequestDto request, User user) {
//         // Get booking by ID
//         Booking booking = bookingRepository.findById(request.getBookingId())
//                 .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

//         // Check if booking belongs to current user
//         if (!booking.getUser().equals(user)) {
//             throw new IllegalArgumentException("You can only request extension for your own bookings");
//         }

//         // Check if booking has more than 20 minutes remaining
//         LocalDateTime now = LocalDateTime.now();
//         LocalDateTime twentyMinutesBeforeEnd = booking.getEndTime().minusMinutes(20);
        
//         if (now.isAfter(twentyMinutesBeforeEnd)) {
//             throw new IllegalArgumentException("You can only request an extension when there are more than 20 minutes remaining");
//         }

//         // Check if there's already an extension request for this booking
//         Optional<RoomCommunication> existingRequest = Optional.ofNullable(roomCommunicationRepository.findByBookingAndIsExtensionTrue(booking));
//         if (existingRequest.isPresent()) {
//             throw new IllegalArgumentException("An extension request already exists for this booking");
//         }

//         // Calculate remaining minutes
//         int remainingMinutes = (int) java.time.temporal.ChronoUnit.MINUTES.between(now, booking.getEndTime());
        
//         // Create new extension request
//         RoomCommunication extensionRequest = new RoomCommunication();
//         extensionRequest.setBooking(booking);
//         extensionRequest.setIsExtension(true);
//         extensionRequest.setMessage(request.getReason());
//         extensionRequest.setExtensionEndTime(request.getNewEndTime());
//         extensionRequest.setRemainingMinutes(remainingMinutes);
//         extensionRequest.setCreatedDate(now);
//         extensionRequest.setUser(user);

//         return roomCommunicationRepository.save(extensionRequest);
//     }
    
//     @Transactional
//     public RoomCommunication handleExtensionRequest(String communicationId, RoomCommunicationStatus status, User admin, String reason) {
//         // Find communication
//         RoomCommunication communication = roomCommunicationRepository.findById(UUID.fromString(communicationId))
//                 .orElseThrow(() -> new IllegalArgumentException("Communication not found"));
        
//         // Validate admin from same organization
//         if (!admin.getOrganization().equals(communication.getBooking().getRoom().getOrganization())) {
//             throw new IllegalArgumentException("Only admins from the same organization can handle extension requests");
//         }
        
//         // Check for one-hour gap requirement
//         if (status == RoomCommunicationStatus.APPROVED) {
//             LocalDateTime proposedEndTime = communication.getExtensionEndTime();
//             LocalDateTime startTimePlusOneHour = communication.getBooking().getStartTime().plusHours(1);
//             LocalDateTime endTimePlusOneHour = proposedEndTime.plusHours(1);
            
//             List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
//                 communication.getBooking().getRoom(),
//                 communication.getBooking().getStartTime(),
//                 proposedEndTime,
//                 startTimePlusOneHour,
//                 endTimePlusOneHour
//             );
            
//             if (!conflictingBookings.isEmpty()) {
//                 throw new IllegalArgumentException("Extension request cannot be approved due to conflicting bookings. Please ensure there is at least one hour gap between bookings.");
//             }
//         }
        
//         // Update status
//         communication.setStatus(status);
        
//         if (status == RoomCommunicationStatus.APPROVED) {
//             // Update booking end time
//             communication.getBooking().setEndTime(communication.getExtensionEndTime());
//             communication.setRemainingMinutes(null); // Reset remaining minutes
//         } else if (status == RoomCommunicationStatus.REJECTED) {
//             communication.setSuspensionReason(reason);
//             // Set status to SUSPENDED if time has expired
//             if (LocalDateTime.now().isAfter(communication.getBooking().getEndTime())) {
//                 communication.setStatus(RoomCommunicationStatus.SUSPENDED);
//             }
//         }
        
//         return roomCommunicationRepository.save(communication);
//     }
    
//     @Transactional
//     public void checkAndHandleExpiredExtensions() {
//         List<Booking> activeBookings = bookingRepository.findActiveBookings();
//         for (Booking booking : activeBookings) {
//             // Check if booking has less than 20 minutes remaining
//             LocalDateTime now = LocalDateTime.now();
//             LocalDateTime twentyMinutesBeforeEnd = booking.getEndTime().minusMinutes(20);
            
//             if (now.isAfter(twentyMinutesBeforeEnd)) {
//                 // Check for pending or rejected extension requests
//                 RoomCommunication extensionRequest = roomCommunicationRepository.findByBookingAndIsExtensionTrueAndStatusNot(booking, RoomCommunicationStatus.APPROVED);
//                 if (extensionRequest != null) {
//                     // If request is pending or rejected, suspend the booking
//                     if (extensionRequest.getStatus() == RoomCommunicationStatus.PENDING || 
//                         extensionRequest.getStatus() == RoomCommunicationStatus.REJECTED) {
//                         extensionRequest.setStatus(RoomCommunicationStatus.SUSPENDED);
//                         extensionRequest.setSuspensionReason("Booking expired without approval");
//                         roomCommunicationRepository.save(extensionRequest);
                        
//                         // Set booking as inactive
//                         booking.setActive(false);
//                         bookingRepository.save(booking);
//                     }
//                 }
//             }
//         }
//     }
// }
