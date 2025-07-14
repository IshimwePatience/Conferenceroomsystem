package Room.ConferenceRoomMgtsys.dto.report;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class RoomUsageReportDto {
    private ReportTimePeriod timePeriod;
    private LocalDateTime reportGeneratedAt;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // System-wide statistics
    private long totalRooms;
    private long activeRooms;
    private long inactiveRooms;

    // Organization-specific statistics
    private Map<String, Long> roomsByOrganization;

    // Most used rooms
    private List<RoomUsageDto> mostUsedRooms;

    public RoomUsageReportDto() {
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

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getActiveRooms() {
        return activeRooms;
    }

    public void setActiveRooms(long activeRooms) {
        this.activeRooms = activeRooms;
    }

    public long getInactiveRooms() {
        return inactiveRooms;
    }

    public void setInactiveRooms(long inactiveRooms) {
        this.inactiveRooms = inactiveRooms;
    }

    public Map<String, Long> getRoomsByOrganization() {
        return roomsByOrganization;
    }

    public void setRoomsByOrganization(Map<String, Long> roomsByOrganization) {
        this.roomsByOrganization = roomsByOrganization;
    }

    public List<RoomUsageDto> getMostUsedRooms() {
        return mostUsedRooms;
    }

    public void setMostUsedRooms(List<RoomUsageDto> mostUsedRooms) {
        this.mostUsedRooms = mostUsedRooms;
    }
}