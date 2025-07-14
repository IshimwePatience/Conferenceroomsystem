package Room.ConferenceRoomMgtsys.dto.report;

public class OrganizationBookingDto {
    private String organizationName;
    private long totalBookings;
    private long approvedBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long pendingBookings;

    public OrganizationBookingDto() {
    }

    public OrganizationBookingDto(String organizationName, long totalBookings, long approvedBookings,
            long completedBookings, long cancelledBookings, long pendingBookings) {
        this.organizationName = organizationName;
        this.totalBookings = totalBookings;
        this.approvedBookings = approvedBookings;
        this.completedBookings = completedBookings;
        this.cancelledBookings = cancelledBookings;
        this.pendingBookings = pendingBookings;
    }

    // Getters and Setters
    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getApprovedBookings() {
        return approvedBookings;
    }

    public void setApprovedBookings(long approvedBookings) {
        this.approvedBookings = approvedBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }
}