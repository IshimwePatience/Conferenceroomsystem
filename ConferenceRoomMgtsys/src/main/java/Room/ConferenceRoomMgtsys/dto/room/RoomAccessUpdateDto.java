package Room.ConferenceRoomMgtsys.dto.room;

import Room.ConferenceRoomMgtsys.enums.RoomAccessLevel;
import java.util.Set;
import java.util.UUID;

public class RoomAccessUpdateDto {
    private UUID roomId;
    private RoomAccessLevel accessLevel;
    private Set<String> allowedOrganizationIds;  // For ORG_ONLY rooms
    
    public UUID getRoomId() {
        return roomId;
    }
    
    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }
    
    public RoomAccessLevel getAccessLevel() {
        return accessLevel;
    }
    
    public void setAccessLevel(RoomAccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }
    
    public Set<String> getAllowedOrganizationIds() {
        return allowedOrganizationIds;
    }
    
    public void setAllowedOrganizationIds(Set<String> allowedOrganizationIds) {
        this.allowedOrganizationIds = allowedOrganizationIds;
    }
}
