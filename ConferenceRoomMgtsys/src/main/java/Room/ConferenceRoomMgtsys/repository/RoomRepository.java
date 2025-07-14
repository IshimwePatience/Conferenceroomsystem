package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.repository.base.SearchableRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends SearchableRepository<Room, UUID> {

        // Single result queries - Use Optional
        Optional<Room> findByOrganizationAndName(Organization organization, String name);

        // Basic queries with Pagination
        Page<Room> findByOrganization(Organization organization, Pageable pageable);

        Page<Room> findByIsActive(Boolean isActive, Pageable pageable);

        Page<Room> findByOrganizationAndIsActive(Organization organization, Boolean isActive, Pageable pageable);

        // List queries for small datasets
        List<Room> findByOrganizationAndIsActive(Organization organization, Boolean isActive);

        List<Room> findByLocation(String location);

        List<Room> findByFloor(String floor);

        List<Room> findAllByOrganization(Organization organization);

        // Capacity queries with Pagination
        Page<Room> findByCapacityGreaterThanEqual(Integer capacity, Pageable pageable);

        Page<Room> findByCapacityBetween(Integer minCapacity, Integer maxCapacity, Pageable pageable);

        // Simple list queries
        @Query("SELECT r FROM Room r WHERE r.organization = :organization AND r.isActive = true ORDER BY r.name ASC")
        List<Room> findActiveRoomsByOrganizationOrderByName(@Param("organization") Organization organization);

        // Availability checking - Keep simple
        @Query("SELECT r FROM Room r WHERE r.organization = :organization AND r.isActive = true AND " +
                        "r.id NOT IN (SELECT b.room.id FROM Booking b WHERE b.startTime < :endTime AND b.endTime > :startTime AND b.status = 'APPROVED')")
        List<Room> findAvailableRooms(@Param("organization") Organization organization,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query("SELECT r FROM Room r WHERE r.organization = :organization AND r.isActive = true AND r.capacity >= :minCapacity AND "
                        +
                        "r.id NOT IN (SELECT b.room.id FROM Booking b WHERE b.startTime < :endTime AND b.endTime > :startTime AND b.status = 'APPROVED')")
        List<Room> findAvailableRoomsWithCapacity(@Param("organization") Organization organization,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime,
                        @Param("minCapacity") Integer minCapacity);

        // Statistics queries
        @Query("SELECT COUNT(r) FROM Room r WHERE r.organization = :organization AND r.isActive = true")
        Long countActiveRoomsByOrganization(@Param("organization") Organization organization);

        @Query("SELECT AVG(r.capacity) FROM Room r WHERE r.organization = :organization AND r.isActive = true")
        Optional<Double> getAverageCapacityByOrganization(@Param("organization") Organization organization);

        @Query("SELECT r.name, COUNT(b) FROM Booking b JOIN b.room r GROUP BY r.name ORDER BY COUNT(b) DESC")
        List<Object[]> findMostUsedRooms();

        // Existence checks
        boolean existsByOrganizationAndName(Organization organization, String name);

        boolean existsByOrganizationAndLocationAndFloor(Organization organization, String location, String floor);

        Long countByOrganization(Organization organization);

        // Projections for performance
        interface RoomSummary {
                UUID getId();

                String getName();

                String getLocation();

                String getFloor();

                Integer getCapacity();

                Boolean getIsActive();
        }

        interface RoomBasicInfo {
                String getName();

                String getLocation();

                Integer getCapacity();
        }

        interface RoomAvailabilityInfo {
                UUID getId();

                String getName();

                Integer getCapacity();

                String getLocation();
        }

        List<RoomSummary> findRoomSummaryByOrganizationAndIsActive(Organization organization, Boolean isActive);

        List<RoomBasicInfo> findRoomBasicInfoByOrganizationAndIsActive(Organization organization, Boolean isActive);

        Page<RoomAvailabilityInfo> findRoomAvailabilityInfoByOrganization(Organization organization, Pageable pageable);

        // Search methods
        @Query("SELECT r FROM Room r WHERE r.name LIKE %:searchTerm% OR r.description LIKE %:searchTerm% OR r.location LIKE %:searchTerm%")
        Page<Room> searchByNameDescriptionOrLocation(@Param("searchTerm") String searchTerm, Pageable pageable);

        // Search rooms by organization
        @Query("SELECT r FROM Room r WHERE r.organization = :organization AND (r.name LIKE %:searchTerm% OR r.description LIKE %:searchTerm% OR r.location LIKE %:searchTerm%)")
        Page<Room> searchByOrganizationAndNameDescriptionOrLocation(@Param("organization") Organization organization,
                        @Param("searchTerm") String searchTerm, Pageable pageable);

        // Global search methods
        @Query("SELECT r FROM Room r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :query, '%'))")
        @Override
        Page<Room> search(String query, Pageable pageable);

        @Query("SELECT r FROM Room r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :query, '%'))")
        @Override
        List<Room> search(String query);

        // Reporting methods
        @Query("SELECT COUNT(r) FROM Room r WHERE r.isActive = :isActive")
        Long countByIsActive(@Param("isActive") Boolean isActive);

        @Query("SELECT COUNT(r) FROM Room r WHERE r.organization = :organization AND r.isActive = :isActive")
        Long countByOrganizationAndIsActive(@Param("organization") Organization organization,
                        @Param("isActive") Boolean isActive);

        @Query("SELECT r.name, COUNT(b) FROM Booking b JOIN b.room r WHERE r.organization = :organization GROUP BY r.name ORDER BY COUNT(b) DESC")
        List<Object[]> findMostUsedRoomsByOrganization(@Param("organization") Organization organization);
}