package Room.ConferenceRoomMgtsys.dto.admin.view;

import java.util.UUID;

public class UserApprovalDto {
    private UUID userId;
    private String action;           
    private String rejectionReason;  

    public UserApprovalDto() {}

    public UserApprovalDto(UUID userId, String action, String rejectionReason) {
        this.userId = userId;
        this.action = action;
        this.rejectionReason = rejectionReason;
    }

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
