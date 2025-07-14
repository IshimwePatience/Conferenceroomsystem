package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.enums.BookingStatus;
import Room.ConferenceRoomMgtsys.model.Booking;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

       // Basic queries with Pagination
       List<Booking> findByUser(User user);

       Page<Booking> findByRoom(Room room, Pageable pageable);

       Page<Booking> findByStatusEquals(BookingStatus status, Pageable pageable);

       // List queries for small datasets
       @Query("SELECT b FROM Booking b WHERE b.isActive = true")
       List<Booking> findActiveBookings();

       List<Booking> findByUserAndStatusEquals(User user, BookingStatus status);

       List<Booking> findByRoomAndStatusEquals(Room room, BookingStatus status);

       List<Booking> findByIsRecurring(Boolean isRecurring);

       List<Booking> findByRoomOrganization(Organization organization);

       // Time-based queries with Pagination
       Page<Booking> findByStartTimeBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

       Page<Booking> findByStartTimeAfter(LocalDateTime dateTime, Pageable pageable);

       // Conflict detection - Keep simple
       @Query("SELECT b FROM Booking b WHERE b.room = :room AND b.status = 'APPROVED' AND " +
                     "(b.startTime < :endTime AND b.endTime > :startTime)")
       List<Booking> findConflictingBookings(@Param("room") Room room,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       @Query("SELECT b FROM Booking b WHERE b.room = :room AND b.status = 'APPROVED' AND b.id != :excludeBookingId AND "
                     +
                     "(b.startTime < :endTime AND b.endTime > :startTime)")
       List<Booking> findConflictingBookingsExcluding(@Param("room") Room room,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime,
                     @Param("excludeBookingId") UUID excludeBookingId);

       // Organization queries with Pagination
       @Query("SELECT b FROM Booking b WHERE b.room.organization = :organization")
       Page<Booking> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

       @Query("SELECT b FROM Booking b WHERE b.room.organization = :organization AND b.status = :status")
       Page<Booking> findByOrganizationAndStatus(@Param("organization") Organization organization,
                     @Param("status") BookingStatus status, Pageable pageable);

       // Simple list queries for common operations
       @Query("SELECT b FROM Booking b WHERE b.user = :user AND b.startTime > :currentTime AND b.status = 'APPROVED' " +
                     "ORDER BY b.startTime ASC")
       List<Booking> findUpcomingBookingsByUser(@Param("user") User user,
                     @Param("currentTime") LocalDateTime currentTime);

       @Query("SELECT b FROM Booking b WHERE b.room = :room AND b.startTime > :currentTime AND b.status = 'APPROVED' " +
                     "ORDER BY b.startTime ASC")
       List<Booking> findUpcomingBookingsByRoom(@Param("room") Room room,
                     @Param("currentTime") LocalDateTime currentTime);

       @Query("SELECT b FROM Booking b WHERE b.room.organization = :organization AND b.status = 'PENDING' " +
                     "ORDER BY b.createdAt ASC")
       List<Booking> findPendingBookingsByOrganization(@Param("organization") Organization organization);

       // Today's bookings
       @Query("SELECT b FROM Booking b WHERE b.room = :room AND " +
                     "DATE(b.startTime) = DATE(:date) AND b.status = 'APPROVED' " +
                     "ORDER BY b.startTime ASC")
       List<Booking> findTodaysBookingsByRoom(@Param("room") Room room,
                     @Param("date") LocalDateTime date);

       // Active/Overdue bookings
       @Query("SELECT b FROM Booking b WHERE b.startTime <= :currentTime AND b.endTime > :currentTime AND b.status = 'APPROVED'")
       List<Booking> findActiveBookings(@Param("currentTime") LocalDateTime currentTime);

       @Query("SELECT b FROM Booking b WHERE b.endTime < :currentTime AND b.actualEndTime IS NULL AND b.status = 'APPROVED'")
       List<Booking> findOverdueBookings(@Param("currentTime") LocalDateTime currentTime);

       // Global upcoming bookings
       @Query("SELECT b FROM Booking b WHERE b.startTime > :currentTime AND b.status = 'APPROVED' ORDER BY b.startTime ASC")
       List<Booking> findUpcomingBookingsGlobal(@Param("currentTime") LocalDateTime currentTime);

       // Search queries with Pagination
       @Query("SELECT b FROM Booking b WHERE b.purpose LIKE %:searchTerm% OR b.notes LIKE %:searchTerm%")
       Page<Booking> searchByPurposeOrNotes(@Param("searchTerm") String searchTerm, Pageable pageable);

       // Global search methods
       @Query("SELECT b FROM Booking b WHERE LOWER(b.purpose) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.notes) LIKE LOWER(CONCAT('%', :query, '%'))")
       Page<Booking> search(@Param("query") String query, Pageable pageable);

       @Query("SELECT b FROM Booking b WHERE LOWER(b.purpose) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.notes) LIKE LOWER(CONCAT('%', :query, '%'))")
       List<Booking> search(@Param("query") String query);

       // Statistics queries
       @Query("SELECT COUNT(b) FROM Booking b WHERE b.user = :user AND b.status = :status")
       Long countBookingsByUserAndStatus(@Param("user") User user, @Param("status") BookingStatus status);

       @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.organization = :organization AND b.status = 'PENDING'")
       Long countPendingBookingsByOrganization(@Param("organization") Organization organization);

       // Projections for performance
       interface BookingSummary {
              UUID getId();

              LocalDateTime getStartTime();

              LocalDateTime getEndTime();

              BookingStatus getStatus();

              String getPurpose();

              User getUser();

              Room getRoom();
       }

       interface BookingBasicInfo {
              UUID getId();

              LocalDateTime getStartTime();

              LocalDateTime getEndTime();

              String getPurpose();

              BookingStatus getStatus();
       }

       interface UserBookingInfo {
              LocalDateTime getStartTime();

              LocalDateTime getEndTime();

              String getPurpose();

              String getRoomName();

              BookingStatus getStatus();
       }

       List<BookingSummary> findBookingSummaryByUserAndStatus(User user, BookingStatus status);

       Page<BookingBasicInfo> findBookingBasicInfoByRoom(Room room, Pageable pageable);

       List<UserBookingInfo> findUserBookingInfoByUserAndStartTimeAfter(User user, LocalDateTime startTime);

       @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.endTime <= :currentTime")
       List<Booking> findEndedBookings(@Param("currentTime") LocalDateTime currentTime);

       // Reporting methods
       @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
       Long countByStatus(@Param("status") BookingStatus status);

       @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.organization = :organization")
       Long countByOrganization(@Param("organization") Organization organization);

       @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.organization = :organization AND b.status = :status")
       Long countByOrganizationAndStatus(@Param("organization") Organization organization,
                     @Param("status") BookingStatus status);

       @Query("SELECT b FROM Booking b WHERE b.status = :status")
       List<Booking> findByStatus(@Param("status") BookingStatus status);

       @Query("SELECT b FROM Booking b WHERE b.room.organization = :organization AND b.status = :status")
       List<Booking> findByOrganizationAndStatus(@Param("organization") Organization organization,
                     @Param("status") BookingStatus status);

       @Query("SELECT COUNT(b) FROM Booking b WHERE b.room = :room")
       Long countByRoom(@Param("room") Room room);

       @Query("SELECT b FROM Booking b WHERE b.room = :room")
       List<Booking> findByRoom(@Param("room") Room room);

       // New methods for improved reporting
       @Query("SELECT o.name, COUNT(b), COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) " +
                     "FROM Booking b JOIN b.room r JOIN r.organization o " +
                     "GROUP BY o.name ORDER BY COUNT(b) DESC")
       List<Object[]> findBookingStatsByOrganization();

       @Query("SELECT r.name, o.name, COUNT(b), " +
                     "COALESCE(SUM(EXTRACT(EPOCH FROM b.endTime) - EXTRACT(EPOCH FROM b.startTime)) / 3600.0, 0.0) " +
                     "FROM Booking b JOIN b.room r JOIN r.organization o " +
                     "WHERE b.status = 'COMPLETED' AND b.startTime IS NOT NULL AND b.endTime IS NOT NULL " +
                     "GROUP BY r.name, o.name ORDER BY COUNT(b) DESC")
       List<Object[]> findMostUsedRoomsWithDetails();

       @Query("SELECT r.name, COUNT(b), " +
                     "COALESCE(SUM(EXTRACT(EPOCH FROM b.endTime) - EXTRACT(EPOCH FROM b.startTime)) / 3600.0, 0.0) " +
                     "FROM Booking b JOIN b.room r WHERE r.organization = :organization " +
                     "AND b.status = 'COMPLETED' AND b.startTime IS NOT NULL AND b.endTime IS NOT NULL " +
                     "GROUP BY r.name ORDER BY COUNT(b) DESC")
       List<Object[]> findMostUsedRoomsByOrganization(@Param("organization") Organization organization);

       // Fetch all bookings for rooms owned by a given organization
       List<Booking> findByRoom_Organization(Organization organization);

       // Find all bookings with status and startTime before a given time
       List<Booking> findByStatusAndStartTimeBefore(BookingStatus status, LocalDateTime time);

       // Find all ongoing approved bookings
       @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.startTime <= :now AND b.endTime >= :now")
       List<Booking> findOngoingApprovedBookings(@Param("now") LocalDateTime now);
}