package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.Availability;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, UUID> {

       // Basic queries with Pagination
       Page<Availability> findByRoom(Room room, Pageable pageable);

       Page<Availability> findByDayOfWeek(DayOfWeek dayOfWeek, Pageable pageable);

       Page<Availability> findByIsAvailable(Boolean isAvailable, Pageable pageable);

       // List queries for small datasets
       List<Availability> findByRoomAndIsAvailable(Room room, Boolean isAvailable);

       List<Availability> findByRoomAndDayOfWeek(Room room, DayOfWeek dayOfWeek);

       List<Availability> findByDayOfWeekAndIsAvailable(DayOfWeek dayOfWeek, Boolean isAvailable);

       // Complete schedule queries
       @Query("SELECT a FROM Availability a WHERE a.room = :room ORDER BY a.dayOfWeek ASC, a.startTime ASC")
       List<Availability> findCompleteScheduleByRoom(@Param("room") Room room);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.isAvailable = true ORDER BY a.dayOfWeek ASC, a.startTime ASC")
       List<Availability> findAvailableScheduleByRoom(@Param("room") Room room);

       // Day-specific queries
       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND a.isAvailable = true ORDER BY a.startTime ASC")
       List<Availability> findAvailableSlotsByRoomAndDay(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek ORDER BY a.startTime ASC")
       List<Availability> findScheduleByRoomAndDay(@Param("room") Room room, @Param("dayOfWeek") DayOfWeek dayOfWeek);

       // Time range queries
       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND " +
                     "a.startTime <= :endTime AND a.endTime >= :startTime AND a.isAvailable = true")
       List<Availability> findAvailableSlotsInTimeRange(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND " +
                     "a.startTime <= :time AND a.endTime >= :time AND a.isAvailable = true")
       List<Availability> findAvailableSlotsAtTime(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("time") LocalTime time);

       // Organization-wide queries
       @Query("SELECT a FROM Availability a WHERE a.room.organization = :organization")
       Page<Availability> findByOrganization(@Param("organization") Organization organization, Pageable pageable);

       @Query("SELECT a FROM Availability a WHERE a.room.organization = :organization AND a.dayOfWeek = :dayOfWeek AND a.isAvailable = true")
       List<Availability> findAvailableSlotsByOrganizationAndDay(@Param("organization") Organization organization,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a FROM Availability a WHERE a.room.organization = :organization AND a.isAvailable = true " +
                     "ORDER BY a.dayOfWeek ASC, a.startTime ASC")
       Page<Availability> findAvailableSlotsByOrganization(@Param("organization") Organization organization,
                     Pageable pageable);

       // Room finder queries
       @Query("SELECT DISTINCT a.room FROM Availability a WHERE a.dayOfWeek = :dayOfWeek AND " +
                     "a.startTime <= :endTime AND a.endTime >= :startTime AND a.isAvailable = true AND a.room.isActive = true")
       List<Room> findAvailableRoomsForTimeSlot(@Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime);

       @Query("SELECT DISTINCT a.room FROM Availability a WHERE a.room.organization = :organization AND " +
                     "a.dayOfWeek = :dayOfWeek AND a.startTime <= :endTime AND a.endTime >= :startTime AND " +
                     "a.isAvailable = true AND a.room.isActive = true")
       List<Room> findAvailableRoomsByOrganizationForTimeSlot(@Param("organization") Organization organization,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime);

       // Conflict detection
       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND " +
                     "((a.startTime < :endTime AND a.endTime > :startTime))")
       List<Availability> findOverlappingSlots(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND a.id != :excludeId AND "
                     +
                     "((a.startTime < :endTime AND a.endTime > :startTime))")
       List<Availability> findOverlappingSlotsExcluding(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime,
                     @Param("excludeId") UUID excludeId);

       // Statistics queries
       @Query("SELECT COUNT(a) FROM Availability a WHERE a.room = :room AND a.isAvailable = true")
       Long countAvailableSlotsByRoom(@Param("room") Room room);

       @Query("SELECT COUNT(a) FROM Availability a WHERE a.room.organization = :organization AND a.isAvailable = true")
       Long countAvailableSlotsByOrganization(@Param("organization") Organization organization);

       @Query("SELECT a.dayOfWeek, COUNT(a) FROM Availability a WHERE a.room = :room AND a.isAvailable = true GROUP BY a.dayOfWeek")
       List<Object[]> countAvailableSlotsByDayForRoom(@Param("room") Room room);

       @Query("SELECT AVG(HOUR(a.endTime) - HOUR(a.startTime)) FROM Availability a WHERE a.room = :room AND a.isAvailable = true")
       Optional<Double> getAverageSlotDurationByRoom(@Param("room") Room room);

       // Specific slot finder
       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND " +
                     "a.startTime = :startTime AND a.endTime = :endTime")
       Optional<Availability> findSpecificSlot(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek,
                     @Param("startTime") LocalTime startTime,
                     @Param("endTime") LocalTime endTime);

       // Existence checks
       boolean existsByRoomAndDayOfWeekAndStartTimeAndEndTime(Room room, DayOfWeek dayOfWeek, LocalTime startTime,
                     LocalTime endTime);

       boolean existsByRoomAndDayOfWeek(Room room, DayOfWeek dayOfWeek);

       // Working hours queries
       @Query("SELECT MIN(a.startTime), MAX(a.endTime) FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek AND a.isAvailable = true")
       List<Object[]> findWorkingHoursByRoomAndDay(@Param("room") Room room, @Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.startTime = (SELECT MIN(a2.startTime) FROM Availability a2 WHERE a2.room = :room AND a2.dayOfWeek = :dayOfWeek AND a2.isAvailable = true) AND a.dayOfWeek = :dayOfWeek")
       Optional<Availability> findEarliestAvailableSlot(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a FROM Availability a WHERE a.room = :room AND a.endTime = (SELECT MAX(a2.endTime) FROM Availability a2 WHERE a2.room = :room AND a2.dayOfWeek = :dayOfWeek AND a2.isAvailable = true) AND a.dayOfWeek = :dayOfWeek")
       Optional<Availability> findLatestAvailableSlot(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek);

       // Projections for performance
       interface AvailabilitySummary {
              UUID getId();

              DayOfWeek getDayOfWeek();

              LocalTime getStartTime();

              LocalTime getEndTime();

              Boolean getIsAvailable();

              Room getRoom();
       }

       interface AvailabilityBasicInfo {
              DayOfWeek getDayOfWeek();

              LocalTime getStartTime();

              LocalTime getEndTime();

              Boolean getIsAvailable();
       }

       interface AvailableTimeSlot {
              DayOfWeek getDayOfWeek();

              LocalTime getStartTime();

              LocalTime getEndTime();

              String getRoomName();

              UUID getRoomId();
       }

       interface DayAvailabilitySummary {
              DayOfWeek getDayOfWeek();

              Long getAvailableSlots();

              LocalTime getEarliestStart();

              LocalTime getLatestEnd();
       }

       // Fixed projection methods with @Query annotations
       @Query("SELECT a.id as id, a.dayOfWeek as dayOfWeek, a.startTime as startTime, " +
                     "a.endTime as endTime, a.isAvailable as isAvailable, a.room as room " +
                     "FROM Availability a WHERE a.room = :room ORDER BY a.dayOfWeek ASC, a.startTime ASC")
       List<AvailabilitySummary> findAvailabilitySummaryByRoom(@Param("room") Room room);

       @Query("SELECT a.dayOfWeek as dayOfWeek, a.startTime as startTime, " +
                     "a.endTime as endTime, a.isAvailable as isAvailable " +
                     "FROM Availability a WHERE a.room = :room AND a.dayOfWeek = :dayOfWeek " +
                     "ORDER BY a.startTime ASC")
       List<AvailabilityBasicInfo> findAvailabilityBasicInfoByRoomAndDayOfWeek(@Param("room") Room room,
                     @Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a.dayOfWeek as dayOfWeek, a.startTime as startTime, a.endTime as endTime, " +
                     "a.room.name as roomName, a.room.id as roomId " +
                     "FROM Availability a WHERE a.dayOfWeek = :dayOfWeek AND a.isAvailable = true " +
                     "ORDER BY a.startTime ASC")
       List<AvailableTimeSlot> findAvailableTimeSlotsForDay(@Param("dayOfWeek") DayOfWeek dayOfWeek);

       @Query("SELECT a.dayOfWeek as dayOfWeek, COUNT(a) as availableSlots, MIN(a.startTime) as earliestStart, MAX(a.endTime) as latestEnd "
                     +
                     "FROM Availability a WHERE a.room = :room AND a.isAvailable = true GROUP BY a.dayOfWeek")
       List<DayAvailabilitySummary> getDayAvailabilitySummaryByRoom(@Param("room") Room room);

       Optional<Availability> findByRoomAndStartTimeAndEndTime(Room room, LocalDateTime startTime,
                     LocalDateTime endTime);

       List<Availability> findByRoom(Room room);
}