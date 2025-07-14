package Room.ConferenceRoomMgtsys.dto.booking;

import Room.ConferenceRoomMgtsys.enums.*;

public class BookingStatusUpdateDto {
    private BookingStatus status;
    private String reason;
    private String notes;

    public BookingStatusUpdateDto() {}

    public BookingStatusUpdateDto(BookingStatus status, String reason, String notes) {
        this.status = status;
        this.reason = reason;
        this.notes = notes;
    }

    // Getters and Setters
    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
