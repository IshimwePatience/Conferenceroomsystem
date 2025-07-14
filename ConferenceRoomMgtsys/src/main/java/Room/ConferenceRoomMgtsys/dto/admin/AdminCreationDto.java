package Room.ConferenceRoomMgtsys.dto.admin;

public class AdminCreationDto {
    private String userId;
    private String organizationName;
    
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getOrganizationName() {
        return organizationName;
    }
    
    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
}
