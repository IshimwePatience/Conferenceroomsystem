package Room.ConferenceRoomMgtsys.dto.availability;

import Room.ConferenceRoomMgtsys.model.Availability;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public class AvailabilityResponseDto {
    private UUID id;
    private UUID roomId;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public static AvailabilityResponseDto fromEntity(Availability availability) {
        AvailabilityResponseDto dto = new AvailabilityResponseDto();
        dto.setId(availability.getId());
        dto.setRoomId(availability.getRoom().getId());
        dto.setDayOfWeek(availability.getDayOfWeek());
        dto.setStartTime(availability.getStartTime());
        dto.setEndTime(availability.getEndTime());
        dto.setIsAvailable(availability.getIsAvailable());
        return dto;
    }
}
