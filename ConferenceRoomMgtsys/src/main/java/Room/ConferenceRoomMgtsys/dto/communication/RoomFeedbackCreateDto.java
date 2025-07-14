package Room.ConferenceRoomMgtsys.dto.communication;

import java.util.UUID;

public class RoomFeedbackCreateDto {
    private UUID bookingId;
    private Integer rating; // 1-5 stars
    private String comment;

    // Constructors
    public RoomFeedbackCreateDto() {}

    // Getters and Setters
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}