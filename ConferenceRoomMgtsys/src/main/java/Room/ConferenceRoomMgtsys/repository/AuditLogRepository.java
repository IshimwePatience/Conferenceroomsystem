package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.AuditLog;
import Room.ConferenceRoomMgtsys.model.Organization;
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
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    // Basic queries with Pagination (Audit logs can be massive)
    Page<AuditLog> findByUser(User user, Pageable pageable);
    Page<AuditLog> findByAction(String action, Pageable pageable);
    Page<AuditLog> findByEntityType(String entityType, Pageable pageable);
    
    // List queries for small datasets only
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<AuditLog> findByUserAndAction(User user, String action);
    
    // Time-based queries with Pagination - Most important for audit logs
    Page<AuditLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<AuditLog> findByTimestampAfter(LocalDateTime dateTime, Pageable pageable);
    Page<AuditLog> findByTimestampBefore(LocalDateTime dateTime, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp >= :startDate AND al.timestamp <= :endDate ORDER BY al.timestamp DESC")
    Page<AuditLog> findAuditLogsInDateRange(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate, 
                                            Pageable pageable);
    
    // User activity tracking
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND al.timestamp >= :since ORDER BY al.timestamp DESC")
    Page<AuditLog> findUserActivitySince(@Param("user") User user, @Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND al.action = :action ORDER BY al.timestamp DESC")
    Page<AuditLog> findUserActionHistory(@Param("user") User user, @Param("action") String action, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND al.timestamp BETWEEN :startDate AND :endDate ORDER BY al.timestamp DESC")
    Page<AuditLog> findUserActivityInDateRange(@Param("user") User user, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate, 
                                               Pageable pageable);
    
    // Entity tracking
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.timestamp DESC")
    List<AuditLog> findEntityHistory(@Param("entityType") String entityType, @Param("entityId") String entityId);
    
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId AND al.action = :action ORDER BY al.timestamp DESC")
    List<AuditLog> findEntityActionHistory(@Param("entityType") String entityType, 
                                           @Param("entityId") String entityId, 
                                           @Param("action") String action);
    
    // Recent activity queries
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp >= :since ORDER BY al.timestamp DESC")
    Page<AuditLog> findRecentActivity(@Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.action = :action AND al.timestamp >= :since ORDER BY al.timestamp DESC")
    Page<AuditLog> findRecentActivityByAction(@Param("action") String action, @Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.timestamp >= :since ORDER BY al.timestamp DESC")
    Page<AuditLog> findRecentActivityByEntityType(@Param("entityType") String entityType, @Param("since") LocalDateTime since, Pageable pageable);
    
    // Organization-level audit tracking
    @Query("SELECT al FROM AuditLog al WHERE al.user.organization = :organization ORDER BY al.timestamp DESC")
    Page<AuditLog> findByOrganization(@Param("organization") Organization organization, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user.organization = :organization AND al.timestamp BETWEEN :startDate AND :endDate ORDER BY al.timestamp DESC")
    Page<AuditLog> findByOrganizationAndDateRange(@Param("organization") Organization organization,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate,
                                                  Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user.organization = :organization AND al.action = :action ORDER BY al.timestamp DESC")
    Page<AuditLog> findByOrganizationAndAction(@Param("organization") Organization organization, 
                                               @Param("action") String action, 
                                               Pageable pageable);
    
    // Search functionality
    @Query("SELECT al FROM AuditLog al WHERE al.details LIKE %:searchTerm% OR al.action LIKE %:searchTerm% OR al.entityType LIKE %:searchTerm% ORDER BY al.timestamp DESC")
    Page<AuditLog> searchByDetailsActionOrEntityType(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND (al.details LIKE %:searchTerm% OR al.action LIKE %:searchTerm%) ORDER BY al.timestamp DESC")
    Page<AuditLog> searchUserAuditLogs(@Param("user") User user, @Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Security and compliance queries
    @Query("SELECT al FROM AuditLog al WHERE al.action IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE') ORDER BY al.timestamp DESC")
    Page<AuditLog> findSecurityEvents(Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND al.action IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN') ORDER BY al.timestamp DESC")
    Page<AuditLog> findUserSecurityEvents(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE al.action LIKE '%DELETE%' OR al.action LIKE '%REMOVE%' ORDER BY al.timestamp DESC")
    Page<AuditLog> findDeletionEvents(Pageable pageable);
    
    @Query("SELECT al FROM AuditLog al WHERE (al.oldValues IS NOT NULL AND al.newValues IS NOT NULL) ORDER BY al.timestamp DESC")
    Page<AuditLog> findDataChangeEvents(Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.user = :user")
    Long countAuditLogsByUser(@Param("user") User user);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.action = :action")
    Long countAuditLogsByAction(@Param("action") String action);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.entityType = :entityType")
    Long countAuditLogsByEntityType(@Param("entityType") String entityType);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.timestamp BETWEEN :startDate AND :endDate")
    Long countAuditLogsInDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.user.organization = :organization AND al.timestamp >= :since")
    Long countOrganizationActivitySince(@Param("organization") Organization organization, @Param("since") LocalDateTime since);
    
    // Top activities queries
    @Query("SELECT al.action, COUNT(al) FROM AuditLog al WHERE al.timestamp >= :since GROUP BY al.action ORDER BY COUNT(al) DESC")
    List<Object[]> findTopActionsSince(@Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT al.user, COUNT(al) FROM AuditLog al WHERE al.timestamp >= :since GROUP BY al.user ORDER BY COUNT(al) DESC")
    List<Object[]> findMostActiveUsersSince(@Param("since") LocalDateTime since, Pageable pageable);
    
    @Query("SELECT al.entityType, COUNT(al) FROM AuditLog al WHERE al.timestamp >= :since GROUP BY al.entityType ORDER BY COUNT(al) DESC")
    List<Object[]> findMostModifiedEntityTypesSince(@Param("since") LocalDateTime since, Pageable pageable);
    
    // Latest activity per entity
    @Query("SELECT al FROM AuditLog al WHERE al.entityType = :entityType AND al.entityId = :entityId AND al.timestamp = " +
           "(SELECT MAX(al2.timestamp) FROM AuditLog al2 WHERE al2.entityType = :entityType AND al2.entityId = :entityId)")
    Optional<AuditLog> findLatestActivityForEntity(@Param("entityType") String entityType, @Param("entityId") String entityId);
    
    @Query("SELECT al FROM AuditLog al WHERE al.user = :user AND al.timestamp = " +
           "(SELECT MAX(al2.timestamp) FROM AuditLog al2 WHERE al2.user = :user)")
    Optional<AuditLog> findLatestActivityByUser(@Param("user") User user);
    
    // Maintenance queries - for cleanup
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp < :cutoffDate")
    Page<AuditLog> findOldAuditLogs(@Param("cutoffDate") LocalDateTime cutoffDate, Pageable pageable);
    
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.timestamp < :cutoffDate")
    Long countOldAuditLogs(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Performance Projections
    interface AuditLogSummary {
        UUID getId();
        String getAction();
        String getEntityType();
        String getEntityId();
        LocalDateTime getTimestamp();
        User getUser();
    }
    
    interface AuditLogBasicInfo {
        String getAction();
        String getEntityType();
        LocalDateTime getTimestamp();
        String getUserFirstName();
        String getUserLastName();
    }
    
    interface SecurityEventInfo {
        UUID getId();
        String getAction();
        LocalDateTime getTimestamp();
        String getUserAgent();
        String getUserEmail();
    }
    
    interface ActivityStatistics {
        String getAction();
        Long getCount();
        LocalDateTime getLatestOccurrence();
    }
    
    interface UserActivitySummary {
        String getUserEmail();
        String getUserFirstName();
        String getUserLastName();
        Long getActivityCount();
        LocalDateTime getLastActivity();
    }
    
    List<AuditLogSummary> findAuditLogSummaryByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<AuditLogBasicInfo> findAuditLogBasicInfoByUserAndTimestampAfter(User user, LocalDateTime since);
    List<SecurityEventInfo> findSecurityEventInfoByTimestampAfter(LocalDateTime since);
    
    @Query("SELECT al.action as action, COUNT(al) as count, MAX(al.timestamp) as latestOccurrence " +
           "FROM AuditLog al WHERE al.timestamp >= :since GROUP BY al.action")
    List<ActivityStatistics> getActivityStatisticsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT al.user.email as userEmail, al.user.firstName as userFirstName, al.user.lastName as userLastName, " +
           "COUNT(al) as activityCount, MAX(al.timestamp) as lastActivity " +
           "FROM AuditLog al WHERE al.timestamp >= :since GROUP BY al.user")
    List<UserActivitySummary> getUserActivitySummarySince(@Param("since") LocalDateTime since);
}