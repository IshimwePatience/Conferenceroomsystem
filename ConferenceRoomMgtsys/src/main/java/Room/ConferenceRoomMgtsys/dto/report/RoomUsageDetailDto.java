package Room.ConferenceRoomMgtsys.dto.report;

import java.time.LocalDateTime;
import java.util.UUID;

public class RoomUsageDetailDto {
    private UUID id;
    private String name;
    private String location;
    private String floor;
    private Integer capacity;
    private String organizationName;
    private Boolean isActive;
    private long totalBookings;
    private double totalUtilizationHours;
    private double averageUtilizationPercentage;
    private LocalDateTime lastBookedAt;
    private LocalDateTime createdAt;
    private String amenities;
    private String equipment;

    public RoomUsageDetailDto() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalUtilizationHours() {
        return totalUtilizationHours;
    }

    public void setTotalUtilizationHours(double totalUtilizationHours) {
        this.totalUtilizationHours = totalUtilizationHours;
    }

    public double getAverageUtilizationPercentage() {
        return averageUtilizationPercentage;
    }

    public void setAverageUtilizationPercentage(double averageUtilizationPercentage) {
        this.averageUtilizationPercentage = averageUtilizationPercentage;
    }

    public LocalDateTime getLastBookedAt() {
        return lastBookedAt;
    }

    public void setLastBookedAt(LocalDateTime lastBookedAt) {
        this.lastBookedAt = lastBookedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
}