package Room.ConferenceRoomMgtsys.dto.dashboard;

import java.util.UUID;

public class PopularRoomDto {
    private UUID roomId;
    private String roomName;
    private String organizationName;
    private long bookingCount;
    private double utilizationRate;

    public PopularRoomDto() {}

    public PopularRoomDto(UUID roomId, String roomName, String organizationName, long bookingCount, double utilizationRate) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.organizationName = organizationName;
        this.bookingCount = bookingCount;
        this.utilizationRate = utilizationRate;
    }

    // Getters and Setters
    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

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

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }
}
