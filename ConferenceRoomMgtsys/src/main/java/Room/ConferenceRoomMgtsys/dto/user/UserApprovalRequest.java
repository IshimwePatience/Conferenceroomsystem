package Room.ConferenceRoomMgtsys.dto.user;

import Room.ConferenceRoomMgtsys.enums.UserRole;

import java.util.UUID;

public class UserApprovalRequest {
    private UUID userId;
    private Boolean approve;
    private UserRole role;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Boolean getApprove() {
        return approve;
    }

    public void setApprove(Boolean approve) {
        this.approve = approve;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}