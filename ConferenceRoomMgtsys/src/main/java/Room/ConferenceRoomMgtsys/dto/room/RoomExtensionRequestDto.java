package Room.ConferenceRoomMgtsys.dto.room;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public class RoomExtensionRequestDto {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "New end time is required")
    @Future(message = "New end time must be in the future")
    private LocalDateTime newEndTime;
    
    private String reason;
    
    public UUID getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }
    
    public LocalDateTime getNewEndTime() {
        return newEndTime;
    }
    
    public void setNewEndTime(LocalDateTime newEndTime) {
        this.newEndTime = newEndTime;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
