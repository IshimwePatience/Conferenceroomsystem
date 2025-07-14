package Room.ConferenceRoomMgtsys.dto.auth;


// import Room.ConferenceRoomMgtsys.enums.*;

public class OAuthLoginDto {
    private String authorizationCode;  // From OAuth provider
    private String state;              // CSRF protection
    private String provider;           //  String instead of enum for user-friendliness
    
   

    public OAuthLoginDto() {}

    public OAuthLoginDto(String authorizationCode, String state, String provider) {
        this.authorizationCode = authorizationCode;
        this.state = state;
        this.provider = provider;
    }

    // Getters and Setters
    public String getAuthorizationCode() {
        return authorizationCode;
    }

    public void setAuthorizationCode(String authorizationCode) {
        this.authorizationCode = authorizationCode;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
