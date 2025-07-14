package Room.ConferenceRoomMgtsys.dto.auth;


public class RefreshTokenRequestDto {
    private String refreshToken;

    public RefreshTokenRequestDto() {}

    public RefreshTokenRequestDto(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    // Getters and Setters
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}