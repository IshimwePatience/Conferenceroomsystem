package Room.ConferenceRoomMgtsys.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Room.ConferenceRoomMgtsys.dto.notification.NotificationResponseDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.NotificationService;

@RestController
@RequestMapping(value = "/notification")
@CrossOrigin(origins = { "http://localhost:5173",  "http://10.8.150.139:8090","https://conferenceroomsystem.vercel.app" })
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get user's notifications with pagination
     * GET /notification/user
     */
    @GetMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<NotificationResponseDto>> getUserNotifications(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        try {
            Page<NotificationResponseDto> notifications = notificationService.getUserNotifications(user, pageable);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Page.empty(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get unread notifications for current user
     * GET /notification/unread
     */
    @GetMapping(value = "/unread", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<NotificationResponseDto>> getUnreadNotifications(
            @AuthenticationPrincipal User user) {
        try {
            List<NotificationResponseDto> notifications = notificationService.getUnreadNotifications(user);
            return new ResponseEntity<>(notifications, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get unread notification count for current user
     * GET /notification/unread/count
     */
    @GetMapping(value = "/unread/count", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal User user) {
        try {
            int unreadCount = notificationService.getUnreadCount(user);
            return new ResponseEntity<>(new UnreadCountResponse(unreadCount), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch unread count: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Mark notification as read
     * PUT /notification/{notificationId}/mark-read
     */
    @PutMapping(value = "/{notificationId}/mark-read", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> markAsRead(@PathVariable UUID notificationId,
            @AuthenticationPrincipal User user) {
        try {
            notificationService.markAsRead(notificationId);
            return new ResponseEntity<>("Notification marked as read", HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to mark notification as read: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Inner class for unread count response
     */
    public static class UnreadCountResponse {
        private int unreadCount;

        public UnreadCountResponse(int unreadCount) {
            this.unreadCount = unreadCount;
        }

        public int getUnreadCount() {
            return unreadCount;
        }

        public void setUnreadCount(int unreadCount) {
            this.unreadCount = unreadCount;
        }
    }
}