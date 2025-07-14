package Room.ConferenceRoomMgtsys.dto.auth;

public class OAuthLoginResponseDto {
    private boolean success;
    private String message;
    private String token;                  
    private String refreshToken;              
    private UserProfileDto user;            
    private String organizationName;        
    private String organizationRole;         
    
    // Multi-organization handling
    private boolean multipleOrganizations;   // True if user belongs to multiple orgs
    private java.util.List<OrganizationOptionDto> availableOrganizations; // If multiple orgs

    public OAuthLoginResponseDto() {}

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public UserProfileDto getUser() {
        return user;
    }

    public void setUser(UserProfileDto user) {
        this.user = user;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationRole() {
        return organizationRole;
    }

    public void setOrganizationRole(String organizationRole) {
        this.organizationRole = organizationRole;
    }

    public boolean isMultipleOrganizations() {
        return multipleOrganizations;
    }

    public void setMultipleOrganizations(boolean multipleOrganizations) {
        this.multipleOrganizations = multipleOrganizations;
    }

    public java.util.List<OrganizationOptionDto> getAvailableOrganizations() {
        return availableOrganizations;
    }

    public void setAvailableOrganizations(java.util.List<OrganizationOptionDto> availableOrganizations) {
        this.availableOrganizations = availableOrganizations;
    }
}

