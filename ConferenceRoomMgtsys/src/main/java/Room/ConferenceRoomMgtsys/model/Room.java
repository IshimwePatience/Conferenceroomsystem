package Room.ConferenceRoomMgtsys.model;

import java.util.List;
import java.util.Set;

import Room.ConferenceRoomMgtsys.enums.RoomAccessLevel;
import Room.ConferenceRoomMgtsys.model.base.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;

@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level")
    private RoomAccessLevel accessLevel = RoomAccessLevel.PRIVATE;

    @ManyToMany
    @JoinTable(name = "room_allowed_organizations", joinColumns = @JoinColumn(name = "room_id"), inverseJoinColumns = @JoinColumn(name = "organization_id"))
    private Set<Organization> allowedOrganizations; // For ORG_ONLY rooms

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "location")
    private String location;

    @Column(name = "floor")
    private String floor;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "equipment", columnDefinition = "TEXT")
    private String equipment;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    // Getters and Setters for access level
    public RoomAccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(RoomAccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public Set<Organization> getAllowedOrganizations() {
        return allowedOrganizations;
    }

    public void setAllowedOrganizations(Set<Organization> allowedOrganizations) {
        this.allowedOrganizations = allowedOrganizations;
    }

    @JsonIgnore
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

    @JsonIgnore
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Availability> availabilities;

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

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public List<Availability> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(List<Availability> availabilities) {
        this.availabilities = availabilities;
    }
}
