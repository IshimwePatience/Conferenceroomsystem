package Room.ConferenceRoomMgtsys.enums;

public enum RoomCommunicationStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled"),
    SUSPENDED("Suspended"),
    COMPLETED("Completed");
    
    private final String description;
    
    RoomCommunicationStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isPending() {
        return this == PENDING;
    }
    
    public boolean isApproved() {
        return this == APPROVED;
    }
    
    public boolean isRejected() {
        return this == REJECTED;
    }
    
    public boolean isSuspended() {
        return this == SUSPENDED;
    }
    
    public boolean isCompleted() {
        return this == COMPLETED;
    }
}
