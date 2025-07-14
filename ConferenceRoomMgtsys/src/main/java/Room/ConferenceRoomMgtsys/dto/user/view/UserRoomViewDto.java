package Room.ConferenceRoomMgtsys.dto.user.view;

public class UserRoomViewDto {
    private String roomName;
    private String description;
    private String organizationName;        // ✅ CLEAR: Which org owns this room
    private Integer capacity;
    private String location;
    private String floor;
    private String amenities;
    private String equipment;
    private String images;
    private String availability;
    private int bookingsToday;
    
    
    private boolean isExternalOrganization;  // true if room.org != user.org
    private String bookingNote;              // "External organization room" or "Your organization"

    public UserRoomViewDto() {}

    // Getters and Setters
    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public int getBookingsToday() {
        return bookingsToday;
    }

    public void setBookingsToday(int bookingsToday) {
        this.bookingsToday = bookingsToday;
    }

    public boolean isExternalOrganization() {
        return isExternalOrganization;
    }

    public void setExternalOrganization(boolean externalOrganization) {
        isExternalOrganization = externalOrganization;
    }

    public String getBookingNote() {
        return bookingNote;
    }

    public void setBookingNote(String bookingNote) {
        this.bookingNote = bookingNote;
    }
}
