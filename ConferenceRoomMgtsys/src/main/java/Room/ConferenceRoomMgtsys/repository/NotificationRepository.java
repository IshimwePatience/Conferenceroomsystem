package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.enums.NotificationType;
import Room.ConferenceRoomMgtsys.model.Notification;
import Room.ConferenceRoomMgtsys.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    // Basic queries with Pagination
    Page<Notification> findByUser(User user, Pageable pageable);
    Page<Notification> findByType(NotificationType type, Pageable pageable);
    Page<Notification> findByIsRead(Boolean isRead, Pageable pageable);
    
    // List queries for small datasets
    List<Notification> findByUserAndIsRead(User user, Boolean isRead);
    List<Notification> findByUserAndType(User user, NotificationType type);
    List<Notification> findByBookingId(String bookingId);
    List<Notification> findByRoomId(String roomId);
    
    // Unread notifications - Most common use case
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotificationsByUser(@Param("user") User user);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadNotificationsByUserPaginated(@Param("user") User user, Pageable pageable);
    
    // Recent notifications
    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotificationsByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findNotificationsByUserSince(@Param("user") User user, @Param("since") LocalDateTime since);
    
    // Type-specific queries
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(@Param("user") User user, @Param("type") NotificationType type);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.type = :type AND n.isRead = false")
    List<Notification> findUnreadByUserAndType(@Param("user") User user, @Param("type") NotificationType type);
    
    // Time-based queries with Pagination
    Page<Notification> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<Notification> findByReadAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    Page<Notification> findByUserAndCreatedAtBetween(@Param("user") User user, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate, 
                                                     Pageable pageable);
    
    // Booking/Room related notifications
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.bookingId = :bookingId ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndBookingId(@Param("user") User user, @Param("bookingId") String bookingId);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.roomId = :roomId ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndRoomId(@Param("user") User user, @Param("roomId") String roomId);
    
    // Search functionality
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND (n.title LIKE %:searchTerm% OR n.message LIKE %:searchTerm%) ORDER BY n.createdAt DESC")
    Page<Notification> searchByUserAndTerm(@Param("user") User user, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT n FROM Notification n WHERE n.title LIKE %:searchTerm% OR n.message LIKE %:searchTerm% ORDER BY n.createdAt DESC")
    Page<Notification> searchByTitleOrMessage(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false")
    Long countUnreadNotificationsByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.type = :type AND n.isRead = false")
    Long countUnreadNotificationsByUserAndType(@Param("user") User user, @Param("type") NotificationType type);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user")
    Long countNotificationsByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.type = :type AND n.createdAt >= :since")
    Long countNotificationsByTypeSince(@Param("type") NotificationType type, @Param("since") LocalDateTime since);
    
    // Cleanup queries - for maintenance
    @Query("SELECT n FROM Notification n WHERE n.isRead = true AND n.readAt < :cutoffDate")
    Page<Notification> findOldReadNotifications(@Param("cutoffDate") LocalDateTime cutoffDate, Pageable pageable);
    
    @Query("SELECT n FROM Notification n WHERE n.createdAt < :cutoffDate")
    Page<Notification> findOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate, Pageable pageable);
    
    // Mark as read - helper queries
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false")
    List<Notification> findUnreadNotificationsForMarkingAsRead(@Param("user") User user);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.type = :type AND n.isRead = false")
    List<Notification> findUnreadNotificationsByTypeForMarkingAsRead(@Param("user") User user, @Param("type") NotificationType type);
    
    // Latest notification per type for user
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.type = :type AND n.createdAt = " +
           "(SELECT MAX(n2.createdAt) FROM Notification n2 WHERE n2.user = :user AND n2.type = :type)")
    Optional<Notification> findLatestNotificationByUserAndType(@Param("user") User user, @Param("type") NotificationType type);
    
    // Projections for performance
    interface NotificationSummary {
        UUID getId();
        String getTitle();
        String getMessage();
        NotificationType getType();
        Boolean getIsRead();
        LocalDateTime getCreatedAt();
    }
    
    interface NotificationBasicInfo {
        String getTitle();
        NotificationType getType();
        Boolean getIsRead();
        LocalDateTime getCreatedAt();
    }
    
    interface UnreadNotificationInfo {
        UUID getId();
        String getTitle();
        NotificationType getType();
        LocalDateTime getCreatedAt();
        String getActionUrl();
    }
    
    interface NotificationCountByType {
        NotificationType getType();
        Long getCount();
    }
    
    List<NotificationSummary> findNotificationSummaryByUserOrderByCreatedAtDesc(User user);
    List<NotificationBasicInfo> findNotificationBasicInfoByUserAndIsRead(User user, Boolean isRead);
    List<UnreadNotificationInfo> findUnreadNotificationInfoByUser(User user);
    
    @Query("SELECT n.type as type, COUNT(n) as count FROM Notification n WHERE n.user = :user AND n.isRead = false GROUP BY n.type")
    List<NotificationCountByType> countUnreadNotificationsByType(@Param("user") User user);
}