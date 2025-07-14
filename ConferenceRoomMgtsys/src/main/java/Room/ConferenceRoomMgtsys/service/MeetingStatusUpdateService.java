package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.enums.BookingStatus;
import Room.ConferenceRoomMgtsys.model.Booking;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class MeetingStatusUpdateService {

    private static final Logger logger = LoggerFactory.getLogger(MeetingStatusUpdateService.class);

    private final BookingRepository bookingRepository;

    public MeetingStatusUpdateService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void updateMeetingStatuses() {
        logger.info("Running scheduled meeting status update at {}", LocalDateTime.now(ZoneId.of("Africa/Kigali")));
        // Get current time in Africa/Kigali timezone
        LocalDateTime currentTime = LocalDateTime.now(ZoneId.of("Africa/Kigali"));

        // Find all approved bookings that have ended
        List<Booking> endedBookings = bookingRepository.findEndedBookings(currentTime);

        if (endedBookings.isEmpty()) {
            logger.info("No ended bookings found to update.");
            return;
        }

        logger.info("Found {} ended bookings to update.", endedBookings.size());
        for (Booking booking : endedBookings) {
            logger.info("Updating booking ID: {} for room {} - Purpose: {}", booking.getId(),
                    booking.getRoom().getName(), booking.getPurpose());
            // Update booking status to COMPLETED
            booking.setStatus(BookingStatus.COMPLETED);
            booking.setIsActive(false);

            // Save the updated booking
            bookingRepository.save(booking);
            logger.info("Booking ID: {} updated to COMPLETED and isActive=false.", booking.getId());
        }
        logger.info("Finished scheduled meeting status update.");
    }
}