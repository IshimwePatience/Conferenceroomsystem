package Room.ConferenceRoomMgtsys.dto.auth;

import java.util.UUID;
/**
 * DTO for representing an organization option in the user registration process.
 * This is used to display a list of organizations for users to select from.
 */
public class OrganizationOptionDto {
    private UUID id;           // For backend use only
    private String name;       // User-friendly display name
    private String description; // Optional: to help users choose
    private String location;   // Optional: to help users choose

    public OrganizationOptionDto() {}

    public OrganizationOptionDto(UUID id, String name, String description, String location) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
