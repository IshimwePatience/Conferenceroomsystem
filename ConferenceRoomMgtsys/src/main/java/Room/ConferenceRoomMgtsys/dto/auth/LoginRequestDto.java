package Room.ConferenceRoomMgtsys.dto.auth;

public class LoginRequestDto {
    private String email;
    private String password;
    private String twoFactorCode;
    private boolean rememberMe = false;

    public LoginRequestDto() {}

    public LoginRequestDto(String email, String password, String twoFactorCode, boolean rememberMe) {
        this.email = email;
        this.password = password;
        this.twoFactorCode = twoFactorCode;
        this.rememberMe = rememberMe;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTwoFactorCode() {
        return twoFactorCode;
    }

    public void setTwoFactorCode(String twoFactorCode) {
        this.twoFactorCode = twoFactorCode;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }
}