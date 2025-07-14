package Room.ConferenceRoomMgtsys.dto.auth;

public class PasswordResetRequestDto {
    private String email;

    public PasswordResetRequestDto() {}

    public PasswordResetRequestDto(String email) {
        this.email = email;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
