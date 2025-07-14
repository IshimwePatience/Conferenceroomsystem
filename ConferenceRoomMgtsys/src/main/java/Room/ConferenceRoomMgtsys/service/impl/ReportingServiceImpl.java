package Room.ConferenceRoomMgtsys.service.impl;

import Room.ConferenceRoomMgtsys.dto.report.*;
import Room.ConferenceRoomMgtsys.dto.report.OrganizationBookingDto;
import Room.ConferenceRoomMgtsys.dto.report.RoomUsageDto;
import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.enums.BookingStatus;
import Room.ConferenceRoomMgtsys.enums.UserRole;

import Room.ConferenceRoomMgtsys.model.Organization;

import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import Room.ConferenceRoomMgtsys.repository.OrganizationRepository;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.service.ReportingService;
import Room.ConferenceRoomMgtsys.service.PdfGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportingServiceImpl implements ReportingService {

    private static final Logger logger = LoggerFactory.getLogger(ReportingServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Override
    @Transactional(readOnly = true)
    public UserReportDto generateSystemUserReport(ReportRequestDto request) {
        logger.info("Generating system user report for time period: {}", request.getTimePeriod());

        UserReportDto report = new UserReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        // System-wide statistics
        report.setTotalUsers(userRepository.count());
        report.setActiveUsers(userRepository.countByIsActive(true));
        report.setInactiveUsers(userRepository.countByIsActive(false));
        report.setPendingApprovalUsers(userRepository.findByApprovalStatus(ApprovalStatus.PENDING).size());
        report.setApprovedUsers(userRepository.findByApprovalStatus(ApprovalStatus.APPROVED).size());
        report.setRejectedUsers(userRepository.findByApprovalStatus(ApprovalStatus.REJECTED).size());

        // Users by organization
        Map<String, Long> usersByOrg = userRepository.countUsersByActiveOrganization().stream()
                .collect(Collectors.toMap(
                        item -> (String) item.get("name"),
                        item -> ((Number) item.get("count")).longValue()));
        report.setUsersByOrganization(usersByOrg);

        // Users by role
        Map<String, Long> usersByRole = Arrays.stream(UserRole.values())
                .collect(Collectors.toMap(
                        UserRole::name,
                        role -> userRepository.countByRole(role)));
        report.setUsersByRole(usersByRole);

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingReportDto generateSystemBookingReport(ReportRequestDto request) {
        logger.info("Generating system booking report for time period: {}", request.getTimePeriod());

        BookingReportDto report = new BookingReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        // System-wide statistics
        report.setTotalBookings(bookingRepository.count());
        report.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));
        report.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));

        // Get organization booking statistics
        List<Object[]> orgBookings = bookingRepository.findBookingStatsByOrganization();
        List<OrganizationBookingDto> organizationBookings = orgBookings.stream()
                .map(row -> new OrganizationBookingDto(
                        (String) row[0], // organization name
                        (Long) row[1], // total bookings
                        0L, // approved bookings (removed)
                        0L, // completed bookings (removed)
                        (Long) row[2], // cancelled bookings
                        0L // pending bookings (removed)
                ))
                .collect(Collectors.toList());
        report.setOrganizationBookings(organizationBookings);

        // Get most used rooms with proper information
        List<Object[]> roomUsage = bookingRepository.findMostUsedRoomsWithDetails();
        List<RoomUsageDto> mostUsedRooms = roomUsage.stream()
                .map(row -> new RoomUsageDto(
                        (String) row[0], // room name
                        (String) row[1], // organization name
                        (Long) row[2], // total bookings
                        ((Number) row[3]).doubleValue(), // total hours
                        0.0 // utilization percentage (calculate if needed)
                ))
                .collect(Collectors.toList());
        report.setMostUsedRooms(mostUsedRooms);

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public RoomUsageReportDto generateSystemRoomUsageReport(ReportRequestDto request) {
        logger.info("Generating system room usage report for time period: {}", request.getTimePeriod());

        RoomUsageReportDto report = new RoomUsageReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        // System-wide statistics
        report.setTotalRooms(roomRepository.count());
        report.setActiveRooms(roomRepository.countByIsActive(true));
        report.setInactiveRooms(roomRepository.countByIsActive(false));

        // Get most used rooms with proper information
        List<Object[]> roomUsage = bookingRepository.findMostUsedRoomsWithDetails();
        List<RoomUsageDto> mostUsedRooms = roomUsage.stream()
                .map(row -> new RoomUsageDto(
                        (String) row[0], // room name
                        (String) row[1], // organization name
                        (Long) row[2], // total bookings
                        ((Number) row[3]).doubleValue(), // total hours
                        0.0 // utilization percentage (calculate if needed)
                ))
                .collect(Collectors.toList());
        report.setMostUsedRooms(mostUsedRooms);

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public UserReportDto generateOrganizationUserReport(ReportRequestDto request, User admin) {
        logger.info("Generating organization user report for admin: {}", admin.getEmail());

        UserReportDto report = new UserReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        Organization org = admin.getOrganization();

        // Organization-specific statistics
        report.setTotalUsers(userRepository.countByOrganization(org));
        report.setActiveUsers(userRepository.countActiveUsersByOrganization(org));
        report.setInactiveUsers(report.getTotalUsers() - report.getActiveUsers());
        report.setPendingApprovalUsers(userRepository.countPendingUsersByOrganization(org));

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingReportDto generateOrganizationBookingReport(ReportRequestDto request, User admin) {
        logger.info("Generating organization booking report for admin: {}", admin.getEmail());

        BookingReportDto report = new BookingReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        Organization org = admin.getOrganization();

        // Organization-specific statistics
        report.setTotalBookings(bookingRepository.countByOrganization(org));
        report.setCancelledBookings(bookingRepository.countByOrganizationAndStatus(org, BookingStatus.CANCELLED));
        report.setCompletedBookings(bookingRepository.countByOrganizationAndStatus(org, BookingStatus.COMPLETED));

        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public RoomUsageReportDto generateOrganizationRoomUsageReport(ReportRequestDto request, User admin) {
        logger.info("Generating organization room usage report for admin: {}", admin.getEmail());

        RoomUsageReportDto report = new RoomUsageReportDto();
        report.setTimePeriod(request.getTimePeriod());
        report.setReportGeneratedAt(LocalDateTime.now());

        LocalDateTime startDate = getStartDate(request);
        LocalDateTime endDate = getEndDate(request);
        report.setStartDate(startDate);
        report.setEndDate(endDate);

        Organization org = admin.getOrganization();

        // Organization-specific statistics
        report.setTotalRooms(roomRepository.countByOrganization(org));
        report.setActiveRooms(roomRepository.countByOrganizationAndIsActive(org, true));
        report.setInactiveRooms(roomRepository.countByOrganizationAndIsActive(org, false));

        // Get most used rooms for this organization
        List<Object[]> roomUsage = bookingRepository.findMostUsedRoomsByOrganization(org);
        List<RoomUsageDto> mostUsedRooms = roomUsage.stream()
                .map(row -> new RoomUsageDto(
                        (String) row[0], // room name
                        org.getName(), // organization name
                        (Long) row[1], // total bookings
                        ((Number) row[2]).doubleValue(), // total hours
                        0.0 // utilization percentage (calculate if needed)
                ))
                .collect(Collectors.toList());
        report.setMostUsedRooms(mostUsedRooms);

        return report;
    }

    @Override
    public byte[] generatePdfReport(ReportRequestDto request, User currentUser) {
        Map<String, Object> data = new HashMap<>();
        String templateName = "";

        switch (request.getReportType()) {
            case "USER_REPORT":
                UserReportDto userReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    userReport = generateSystemUserReport(request);
                } else {
                    userReport = generateOrganizationUserReport(request, currentUser);
                }
                data.put("report", userReport);
                templateName = "user-report";
                break;
            case "BOOKING_REPORT":
                BookingReportDto bookingReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    bookingReport = generateSystemBookingReport(request);
                } else {
                    bookingReport = generateOrganizationBookingReport(request, currentUser);
                }
                data.put("report", bookingReport);
                templateName = "booking-report";
                break;
            case "ROOM_USAGE_REPORT":
                RoomUsageReportDto roomUsageReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    roomUsageReport = generateSystemRoomUsageReport(request);
                } else {
                    roomUsageReport = generateOrganizationRoomUsageReport(request, currentUser);
                }
                data.put("report", roomUsageReport);
                templateName = "room-usage-report";
                break;
            default:
                throw new IllegalArgumentException("Invalid report type: " + request.getReportType());
        }

        return pdfGenerationService.generatePdfFromHtml(templateName, data);
    }

    @Override
    public ReportTimePeriod calculateTimePeriod(ReportRequestDto request) {
        if (request.getTimePeriod() != null) {
            return request.getTimePeriod();
        }

        if (request.getStartDate() != null && request.getEndDate() != null) {
            return ReportTimePeriod.CUSTOM;
        }

        return ReportTimePeriod.MONTHLY; // Default
    }

    @Override
    public boolean hasAccessToOrganization(User user, UUID organizationId) {
        if (user.getRole() == UserRole.SYSTEM_ADMIN) {
            return true; // System admin has access to all organizations
        }

        if (user.getRole() == UserRole.ADMIN) {
            return user.getOrganization().getId().equals(organizationId);
        }

        return false; // Regular users don't have access to organization reports
    }

    // Helper methods
    private LocalDateTime getStartDate(ReportRequestDto request) {
        if (request.getStartDate() != null) {
            return request.getStartDate().atStartOfDay();
        }

        LocalDate now = LocalDate.now();
        switch (request.getTimePeriod()) {
            case WEEKLY:
                return now.minusWeeks(1).atStartOfDay();
            case MONTHLY:
                return now.minusMonths(1).atStartOfDay();
            case YEARLY:
                return now.minusYears(1).atStartOfDay();
            default:
                return now.minusMonths(1).atStartOfDay();
        }
    }

    private LocalDateTime getEndDate(ReportRequestDto request) {
        if (request.getEndDate() != null) {
            return request.getEndDate().atTime(LocalTime.MAX);
        }

        return LocalDateTime.now();
    }
}