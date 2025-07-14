package Room.ConferenceRoomMgtsys.dto.report;

import java.time.LocalDateTime;
import java.util.List;

public class BookingReportDto {
    private ReportTimePeriod timePeriod;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Summary statistics
    private long totalBookings;
    private long cancelledBookings;
    private long completedBookings;

    // Organization-specific statistics
    private List<OrganizationBookingDto> organizationBookings;

    // Room usage statistics
    private List<RoomUsageDto> mostUsedRooms;

    public BookingReportDto() {
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

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public List<OrganizationBookingDto> getOrganizationBookings() {
        return organizationBookings;
    }

    public void setOrganizationBookings(List<OrganizationBookingDto> organizationBookings) {
        this.organizationBookings = organizationBookings;
    }

    public List<RoomUsageDto> getMostUsedRooms() {
        return mostUsedRooms;
    }

    public void setMostUsedRooms(List<RoomUsageDto> mostUsedRooms) {
        this.mostUsedRooms = mostUsedRooms;
    }
}