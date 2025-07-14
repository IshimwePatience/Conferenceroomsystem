package Room.ConferenceRoomMgtsys.dto.notification;

import Room.ConferenceRoomMgtsys.enums.NotificationType;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class WebSocketNotificationDto {
    private UUID id;
    private NotificationType type;
    private String title;
    private String message;
    private String bookingId;
    private String roomId;
    private String actionUrl;
    private LocalDateTime timestamp;
    private boolean isRead;
}
