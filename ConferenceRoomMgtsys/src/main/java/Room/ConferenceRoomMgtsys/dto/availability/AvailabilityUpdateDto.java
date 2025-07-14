package Room.ConferenceRoomMgtsys.dto.availability;

import Room.ConferenceRoomMgtsys.model.Availability;
import java.time.LocalTime;

public class AvailabilityUpdateDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;

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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public void updateEntity(Availability availability) {
        if (startTime != null) {
            availability.setStartTime(startTime);
        }
        if (endTime != null) {
            availability.setEndTime(endTime);
        }
        if (available != availability.getIsAvailable()) {
            availability.setIsAvailable(available);
        }
    }
}
