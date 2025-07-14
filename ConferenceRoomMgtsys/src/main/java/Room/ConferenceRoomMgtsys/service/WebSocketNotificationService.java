package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.notification.WebSocketNotificationDto;
import Room.ConferenceRoomMgtsys.model.Notification;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.Booking;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


@Service
public class WebSocketNotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotification(User user, Notification notification) {
        WebSocketNotificationDto dto = new WebSocketNotificationDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setBookingId(notification.getBookingId());
        dto.setRoomId(notification.getRoomId());
        dto.setActionUrl(notification.getActionUrl());
        dto.setTimestamp(notification.getCreatedAt());
        dto.setRead(notification.getIsRead());

        // Send to user's specific topic
        String destination = "/topic/notifications/" + user.getId();
        messagingTemplate.convertAndSend(destination, dto);
    }

    public void sendRoomStatusUpdate(Room room, String status) {
        // Send room status update to all users
        String destination = "/topic/rooms/" + room.getId() + "/status";
        messagingTemplate.convertAndSend(destination, status);
    }

    public void sendBookingUpdate(Booking booking, String status) {
        // Send booking update to room and user
        String roomDestination = "/topic/rooms/" + booking.getRoom().getId() + "/booking";
        String userDestination = "/topic/users/" + booking.getUser().getId() + "/booking";
        
        messagingTemplate.convertAndSend(roomDestination, status);
        messagingTemplate.convertAndSend(userDestination, status);
    }
}
