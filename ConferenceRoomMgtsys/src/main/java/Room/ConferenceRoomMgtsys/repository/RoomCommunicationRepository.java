package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.Booking;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.RoomCommunication;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.enums.RoomCommunicationStatus;
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
public interface RoomCommunicationRepository extends JpaRepository<RoomCommunication, UUID> {

    // Basic queries with Pagination
    Page<RoomCommunication> findByBooking(Booking booking, Pageable pageable);

    Page<RoomCommunication> findByUser(User user, Pageable pageable);

    Page<RoomCommunication> findByIsFromAdmin(Boolean isFromAdmin, Pageable pageable);

    // List queries for small datasets
    List<RoomCommunication> findByBookingAndUser(Booking booking, User user);

    List<RoomCommunication> findByBookingAndIsFromAdmin(Booking booking, Boolean isFromAdmin);

    List<RoomCommunication> findByIsRead(Boolean isRead);

    // Ordered queries for conversation display
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking ORDER BY rc.createdAt ASC")
    List<RoomCommunication> findByBookingOrderByCreatedAtAsc(@Param("booking") Booking booking);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking ORDER BY rc.createdAt DESC")
    Page<RoomCommunication> findByBookingOrderByCreatedAtDesc(@Param("booking") Booking booking, Pageable pageable);

    @Query("SELECT c FROM RoomCommunication c WHERE c.booking = :booking AND c.isExtension = true")
    RoomCommunication findByBookingAndIsExtensionTrue(@Param("booking") Booking booking);

    @Query("SELECT c FROM RoomCommunication c WHERE c.booking = :booking AND c.isExtension = true AND c.status != :status")
    RoomCommunication findByBookingAndIsExtensionTrueAndStatusNot(@Param("booking") Booking booking,
            @Param("status") RoomCommunicationStatus status);

    // Unread messages - Keep simple
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.user = :user AND rc.isRead = false ORDER BY rc.createdAt DESC")
    List<RoomCommunication> findUnreadMessagesByUser(@Param("user") User user);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking AND rc.user = :user AND rc.isRead = false")
    List<RoomCommunication> findUnreadMessagesByBookingAndUser(@Param("booking") Booking booking,
            @Param("user") User user);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.isFromAdmin = false AND rc.isRead = false ORDER BY rc.createdAt DESC")
    List<RoomCommunication> findUnreadUserMessages();

    // Organization queries with Pagination
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking.room.organization = :organization")
    Page<RoomCommunication> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking.room.organization = :organization AND rc.isRead = false")
    Page<RoomCommunication> findUnreadByOrganization(@Param("organization") Organization organization,
            Pageable pageable);

    // Recent messages
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.createdAt >= :since ORDER BY rc.createdAt DESC")
    List<RoomCommunication> findRecentMessages(@Param("since") LocalDateTime since);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking AND rc.createdAt >= :since ORDER BY rc.createdAt DESC")
    List<RoomCommunication> findRecentMessagesByBooking(@Param("booking") Booking booking,
            @Param("since") LocalDateTime since);

    // Search with Pagination
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.message LIKE %:searchTerm% ORDER BY rc.createdAt DESC")
    Page<RoomCommunication> searchByMessage(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking AND rc.message LIKE %:searchTerm% ORDER BY rc.createdAt DESC")
    List<RoomCommunication> searchByBookingAndMessage(@Param("booking") Booking booking,
            @Param("searchTerm") String searchTerm);

    // Latest message per booking
    @Query("SELECT rc FROM RoomCommunication rc WHERE rc.booking = :booking AND rc.createdAt = " +
            "(SELECT MAX(rc2.createdAt) FROM RoomCommunication rc2 WHERE rc2.booking = :booking)")
    Optional<RoomCommunication> findLatestMessageByBooking(@Param("booking") Booking booking);

    // Statistics queries
    @Query("SELECT COUNT(rc) FROM RoomCommunication rc WHERE rc.booking = :booking")
    Long countMessagesByBooking(@Param("booking") Booking booking);

    @Query("SELECT COUNT(rc) FROM RoomCommunication rc WHERE rc.user = :user AND rc.isRead = false")
    Long countUnreadMessagesByUser(@Param("user") User user);

    @Query("SELECT COUNT(rc) FROM RoomCommunication rc WHERE rc.booking.room.organization = :organization AND rc.isRead = false")
    Long countUnreadMessagesByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(rc) FROM RoomCommunication rc WHERE rc.isFromAdmin = false AND rc.isRead = false")
    Long countUnreadUserMessages();

    // Projections for performance
    interface MessageSummary {
        UUID getId();

        String getMessage();

        Boolean getIsFromAdmin();

        Boolean getIsRead();

        LocalDateTime getCreatedAt();

        User getUser();
    }

    interface MessageBasicInfo {
        String getMessage();

        Boolean getIsFromAdmin();

        LocalDateTime getCreatedAt();

        String getUserFirstName();

        String getUserLastName();
    }

    interface UnreadMessageInfo {
        UUID getId();

        String getMessage();

        Boolean getIsFromAdmin();

        LocalDateTime getCreatedAt();

        UUID getBookingId();
    }

    List<MessageSummary> findMessageSummaryByBookingOrderByCreatedAtAsc(Booking booking);

    List<MessageBasicInfo> findMessageBasicInfoByBookingOrderByCreatedAtAsc(Booking booking);

    List<UnreadMessageInfo> findUnreadMessageInfoByUser(User user);

    List<RoomCommunication> findByBooking_Room(Room room);
}