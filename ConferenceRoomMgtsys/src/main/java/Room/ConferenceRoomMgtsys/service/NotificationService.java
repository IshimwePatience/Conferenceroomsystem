package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.notification.NotificationResponseDto;
import Room.ConferenceRoomMgtsys.model.Notification;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.NotificationRepository;
import Room.ConferenceRoomMgtsys.enums.NotificationType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final WebSocketNotificationService webSocketNotificationService;

    public NotificationService(NotificationRepository notificationRepository, WebSocketNotificationService webSocketNotificationService) {
        this.notificationRepository = notificationRepository;
        this.webSocketNotificationService = webSocketNotificationService;
    }

    @Transactional
    public Notification createNotification(User user, NotificationType type, String title, String message, String bookingId, String roomId, String actionUrl) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setBookingId(bookingId);
        notification.setRoomId(roomId);
        notification.setActionUrl(actionUrl);
        
        Notification savedNotification = notificationRepository.save(notification);
        webSocketNotificationService.sendNotification(user, savedNotification);
        return savedNotification;
    }

    @Transactional
    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        webSocketNotificationService.sendNotification(notification.getUser(), savedNotification);
        return savedNotification;
    }

    public Page<NotificationResponseDto> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUser(user, pageable)
                .map(this::convertToDto);
    }

    public List<NotificationResponseDto> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsRead(user, false)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    public int getUnreadCount(User user) {
        return notificationRepository.findUnreadNotificationsByUser(user).size();
    }

    private NotificationResponseDto convertToDto(Notification notification) {
        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setType(notification.getType().name());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setReadTime(notification.getReadAt() != null ? notification.getReadAt().toString() : null);
        dto.setReadTime(notification.getReadAt() != null ? notification.getReadAt().toString() : null);
        dto.setRoomName(notification.getRoomId()); // You might want to fetch actual room name from Room entity
        dto.setBookingDetails(notification.getBookingId()); // You might want to fetch actual booking details
        dto.setActionText(notification.getActionUrl() != null ? "View Details" : null);
        return dto;
    }
}
