package Room.ConferenceRoomMgtsys.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for creating a new organization.
 * This DTO contains all the necessary information to create an organization.
 */
public class OrganizationCreateDto {
    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Organization name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Organization code is required")
    @Size(min = 3, max = 20, message = "Organization code must be between 3 and 20 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Organization code must contain only uppercase letters and numbers")
    private String organizationCode;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$", message = "Invalid URL format")
    private String logoUrl;

    public OrganizationCreateDto() {
    }

    public OrganizationCreateDto(String name, String organizationCode, String description, String address, String phone,
            String email, String logoUrl) {
        this.name = name;
        this.organizationCode = organizationCode;
        this.description = description;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.logoUrl = logoUrl;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOrganizationCode() {
        return organizationCode;
    }

    public void setOrganizationCode(String organizationCode) {
        this.organizationCode = organizationCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
