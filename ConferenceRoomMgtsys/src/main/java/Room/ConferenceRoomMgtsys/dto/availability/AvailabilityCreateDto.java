package Room.ConferenceRoomMgtsys.dto.availability;

import Room.ConferenceRoomMgtsys.model.Availability;
import Room.ConferenceRoomMgtsys.model.Room;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public class AvailabilityCreateDto {
    private UUID roomId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available = true;

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsAvailable() {
        return available;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.available = isAvailable;
    }

    public Room getRoom() {
        return new Room(); // This should be set by the service layer
    }

    public Availability toEntity() {
        Availability availability = new Availability();
        availability.setRoom(new Room()); // Room will be set by service
        availability.setDayOfWeek(dayOfWeek);
        availability.setStartTime(startTime);
        availability.setEndTime(endTime);
        availability.setIsAvailable(available);
        return availability;
    }
}
