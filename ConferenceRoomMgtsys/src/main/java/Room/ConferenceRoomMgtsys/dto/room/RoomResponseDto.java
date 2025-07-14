package Room.ConferenceRoomMgtsys.dto.room;

import Room.ConferenceRoomMgtsys.dto.base.BaseResponseDto;
import Room.ConferenceRoomMgtsys.enums.RoomAccessLevel;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;

public class RoomResponseDto extends BaseResponseDto {
    private String name;
    private String description;
    private UUID organizationId;
    private String organizationName;
    private Integer capacity;
    private String location;
    private String floor;
    private boolean isActive;
    private String amenities;
    private String equipment;
    private String images;
    private boolean isAvailable;
    private int totalBookingsToday;
    private RoomAccessLevel accessLevel;
    private Set<UUID> allowedOrganizationIds = new HashSet<>();

    public RoomResponseDto() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public int getTotalBookingsToday() {
        return totalBookingsToday;
    }

    public void setTotalBookingsToday(int totalBookingsToday) {
        this.totalBookingsToday = totalBookingsToday;
    }

    public RoomAccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(RoomAccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public Set<UUID> getAllowedOrganizationIds() {
        return allowedOrganizationIds;
    }

    public void setAllowedOrganizationIds(Set<UUID> allowedOrganizationIds) {
        this.allowedOrganizationIds = allowedOrganizationIds;
    }
}
