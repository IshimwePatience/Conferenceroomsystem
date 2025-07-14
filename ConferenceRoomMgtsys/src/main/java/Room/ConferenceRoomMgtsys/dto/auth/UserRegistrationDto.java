package Room.ConferenceRoomMgtsys.dto.auth;


public class UserRegistrationDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String confirmPassword;
    
    // ✅ CHANGED: From UUID to user-friendly organization name
    private String organizationName;  // User selects by name, not UUID

    public UserRegistrationDto() {}

    public UserRegistrationDto(String firstName, String lastName, String email, String password, String confirmPassword, String organizationName) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.organizationName = organizationName;
    }

    // Getters and Setters
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

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

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    // ✅ NEW: Organization by name instead of UUID
    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
}
