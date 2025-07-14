package Room.ConferenceRoomMgtsys.service.impl;

import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.enums.BookingStatus;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import Room.ConferenceRoomMgtsys.repository.OrganizationRepository;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.service.DashboardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final OrganizationRepository organizationRepository;

    public DashboardServiceImpl(UserRepository userRepository, RoomRepository roomRepository,
            BookingRepository bookingRepository, OrganizationRepository organizationRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.organizationRepository = organizationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Object getSystemAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Welcome System Admin!");
        dashboard.put("totalUsers", userRepository.countByIsActive(true));
        dashboard.put("pendingApprovals", userRepository.findByApprovalStatus(ApprovalStatus.PENDING).size());
        dashboard.put("totalOrganizations", organizationRepository.countByIsActive(true));
        dashboard.put("totalRooms", roomRepository.count());
        dashboard.put("totalBookings", bookingRepository.count());
        dashboard.put("activeBookings", bookingRepository.findActiveBookings(LocalDateTime.now()).size());
        dashboard.put("totalUsersInOrg", userRepository.countUsersByActiveOrganization());
        dashboard.put("mostUsedRooms", roomRepository.findMostUsedRooms());

        // Add organizations data
        List<Organization> activeOrganizations = organizationRepository.findByIsActive(true);
        logger.info("Fetched {} active organizations.", activeOrganizations.size());
        activeOrganizations
                .forEach(org -> logger.info("  Organization: {}, Logo URL: {}", org.getName(), org.getLogoUrl()));

        List<Map<String, Object>> organizationsData = activeOrganizations.stream()
                .map(org -> {
                    Map<String, Object> orgData = new HashMap<>();
                    orgData.put("id", org.getId());
                    orgData.put("name", org.getName());
                    orgData.put("organizationCode", org.getOrganizationCode());
                    orgData.put("description", org.getDescription());
                    orgData.put("address", org.getAddress());
                    orgData.put("phone", org.getPhone());
                    orgData.put("email", org.getEmail());
                    orgData.put("logoUrl", org.getLogoUrl());
                    orgData.put("totalUsers", userRepository.countActiveUsersByOrganization(org));
                    orgData.put("totalRooms", roomRepository.countByOrganization(org));
                    return orgData;
                })
                .collect(Collectors.toList());
        dashboard.put("organizations", organizationsData);

        return dashboard;
    }

    @Override
    public Object getAdminDashboard(User admin) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Welcome Admin!");
        dashboard.put("organization", admin.getOrganization().getName());
        dashboard.put("totalRooms", roomRepository.countByOrganization(admin.getOrganization()));
        dashboard.put("activeBookings", bookingRepository.findActiveBookings(LocalDateTime.now()).size());
        dashboard.put("pendingBookings", bookingRepository.countPendingBookingsByOrganization(admin.getOrganization()));
        dashboard.put("totalUsersInOrg", userRepository.countActiveUsersByOrganization(admin.getOrganization()));
        return dashboard;
    }

    @Override
    public Object getUserDashboard(User user) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Welcome " + user.getFirstName() + "!");
        dashboard.put("myBookings", bookingRepository.findByUser(user).size());
        dashboard.put("upcomingMeetings",
                bookingRepository.findUpcomingBookingsByUser(user, LocalDateTime.now()).size());
        dashboard.put("pendingBookings", bookingRepository.countBookingsByUserAndStatus(user, BookingStatus.PENDING));
        return dashboard;
    }
}