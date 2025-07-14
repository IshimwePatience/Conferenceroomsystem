package Room.ConferenceRoomMgtsys.dto.user.view;

public class UserProfileViewDto {
    private String fullName;
    private String email;
    private String role; // "User" or "Administrator"
    private String organizationName;
    private String profilePictureUrl;
    private String memberSince; // "Member since January 2024"
    private String lastLogin; // "Last seen 2 hours ago"
    private boolean hasTwoFactor;
    private boolean isEmailVerified;
    private int totalBookings;
    private int activeBookings;

    public UserProfileViewDto() {}

    // Getters and Setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(String memberSince) {
        this.memberSince = memberSince;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isHasTwoFactor() {
        return hasTwoFactor;
    }

    public void setHasTwoFactor(boolean hasTwoFactor) {
        this.hasTwoFactor = hasTwoFactor;
    }

    public boolean isEmailVerified() {
        return isEmailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        isEmailVerified = emailVerified;
    }

    public int getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(int totalBookings) {
        this.totalBookings = totalBookings;
    }

    public int getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(int activeBookings) {
        this.activeBookings = activeBookings;
    }
}

