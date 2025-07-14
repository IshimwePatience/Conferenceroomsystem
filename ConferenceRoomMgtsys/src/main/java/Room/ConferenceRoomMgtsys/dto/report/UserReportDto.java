package Room.ConferenceRoomMgtsys.dto.report;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class UserReportDto {
    private ReportTimePeriod timePeriod;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // System-wide statistics
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long pendingApprovalUsers;
    private long approvedUsers;
    private long rejectedUsers;

    // Organization-specific statistics
    private Map<String, Long> usersByOrganization;
    private Map<String, Long> activeUsersByOrganization;
    private Map<String, Long> inactiveUsersByOrganization;

    // User activity statistics
    private long usersWithRecentActivity; // Users who logged in within last 30 days
    private long usersWithNoRecentActivity;
    private Map<String, Long> usersByRole;

    // Detailed user lists
    private List<UserReportDetailDto> activeUserDetails;
    private List<UserReportDetailDto> inactiveUserDetails;
    private List<UserReportDetailDto> pendingUserDetails;

    public UserReportDto() {
    }

    // Getters and Setters
    public ReportTimePeriod getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(ReportTimePeriod timePeriod) {
        this.timePeriod = timePeriod;
    }

    public LocalDateTime getReportGeneratedAt() {
        return reportGeneratedAt;
    }

    public void setReportGeneratedAt(LocalDateTime reportGeneratedAt) {
        this.reportGeneratedAt = reportGeneratedAt;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public void setInactiveUsers(long inactiveUsers) {
        this.inactiveUsers = inactiveUsers;
    }

    public long getPendingApprovalUsers() {
        return pendingApprovalUsers;
    }

    public void setPendingApprovalUsers(long pendingApprovalUsers) {
        this.pendingApprovalUsers = pendingApprovalUsers;
    }

    public long getApprovedUsers() {
        return approvedUsers;
    }

    public void setApprovedUsers(long approvedUsers) {
        this.approvedUsers = approvedUsers;
    }

    public long getRejectedUsers() {
        return rejectedUsers;
    }

    public void setRejectedUsers(long rejectedUsers) {
        this.rejectedUsers = rejectedUsers;
    }

    public Map<String, Long> getUsersByOrganization() {
        return usersByOrganization;
    }

    public void setUsersByOrganization(Map<String, Long> usersByOrganization) {
        this.usersByOrganization = usersByOrganization;
    }

    public Map<String, Long> getActiveUsersByOrganization() {
        return activeUsersByOrganization;
    }

    public void setActiveUsersByOrganization(Map<String, Long> activeUsersByOrganization) {
        this.activeUsersByOrganization = activeUsersByOrganization;
    }

    public Map<String, Long> getInactiveUsersByOrganization() {
        return inactiveUsersByOrganization;
    }

    public void setInactiveUsersByOrganization(Map<String, Long> inactiveUsersByOrganization) {
        this.inactiveUsersByOrganization = inactiveUsersByOrganization;
    }

    public long getUsersWithRecentActivity() {
        return usersWithRecentActivity;
    }

    public void setUsersWithRecentActivity(long usersWithRecentActivity) {
        this.usersWithRecentActivity = usersWithRecentActivity;
    }

    public long getUsersWithNoRecentActivity() {
        return usersWithNoRecentActivity;
    }

    public void setUsersWithNoRecentActivity(long usersWithNoRecentActivity) {
        this.usersWithNoRecentActivity = usersWithNoRecentActivity;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public List<UserReportDetailDto> getActiveUserDetails() {
        return activeUserDetails;
    }

    public void setActiveUserDetails(List<UserReportDetailDto> activeUserDetails) {
        this.activeUserDetails = activeUserDetails;
    }

    public List<UserReportDetailDto> getInactiveUserDetails() {
        return inactiveUserDetails;
    }

    public void setInactiveUserDetails(List<UserReportDetailDto> inactiveUserDetails) {
        this.inactiveUserDetails = inactiveUserDetails;
    }

    public List<UserReportDetailDto> getPendingUserDetails() {
        return pendingUserDetails;
    }

    public void setPendingUserDetails(List<UserReportDetailDto> pendingUserDetails) {
        this.pendingUserDetails = pendingUserDetails;
    }
}