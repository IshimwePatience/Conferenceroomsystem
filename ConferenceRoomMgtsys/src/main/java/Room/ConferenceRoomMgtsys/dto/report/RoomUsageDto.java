package Room.ConferenceRoomMgtsys.dto.report;

public class RoomUsageDto {
    private String roomName;
    private String organizationName;
    private long totalBookings;
    private double totalHoursUsed;
    private double utilizationPercentage;

    public RoomUsageDto() {
    }

    public RoomUsageDto(String roomName, String organizationName, long totalBookings, double totalHoursUsed,
            double utilizationPercentage) {
        this.roomName = roomName;
        this.organizationName = organizationName;
        this.totalBookings = totalBookings;
        this.totalHoursUsed = totalHoursUsed;
        this.utilizationPercentage = utilizationPercentage;
    }

    // Getters and Setters
    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

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

    public double getTotalHoursUsed() {
        return totalHoursUsed;
    }

    public void setTotalHoursUsed(double totalHoursUsed) {
        this.totalHoursUsed = totalHoursUsed;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }
}