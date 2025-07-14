package Room.ConferenceRoomMgtsys.dto.user;

import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.model.User;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponseDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private String organizationName;
    private String profilePictureUrl;
    private Boolean isActive;
    private Boolean isApproved;
    private LocalDateTime lastLoginAt;
    private LocalDateTime approvedAt;
    private String approvedByName;

    public static UserResponseDto fromUser(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setOrganizationName(user.getOrganization() != null ? user.getOrganization().getName() : null);
        dto.setProfilePictureUrl(user.getProfilePictureUrl());
        dto.setIsActive(user.getIsActive());
        dto.setIsApproved(user.getIsApproved());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setApprovedAt(user.getApprovedAt());
        if (user.getApprovedBy() != null) {
            dto.setApprovedByName(user.getApprovedBy().getFirstName() + " " + user.getApprovedBy().getLastName());
        }
        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }
}