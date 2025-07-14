package Room.ConferenceRoomMgtsys.enums;

public enum RoomAccessLevel {
    PRIVATE("Only users from the same organization can book"),
    PUBLIC("Any user can book"),
    ORG_ONLY("Only users from specific organizations can book");
    
    private final String description;
    
    RoomAccessLevel(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
