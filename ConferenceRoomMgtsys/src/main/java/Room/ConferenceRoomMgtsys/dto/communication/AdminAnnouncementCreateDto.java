package Room.ConferenceRoomMgtsys.dto.communication;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminAnnouncementCreateDto {
    private UUID roomId;
    private String title;
    private String message;
    private String priority; // HIGH, MEDIUM, LOW
    private LocalDateTime expiryDate;

    // Constructors
    public AdminAnnouncementCreateDto() {}

    // Getters and Setters
    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}
