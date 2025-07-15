package Room.ConferenceRoomMgtsys.controller;

import java.time.DayOfWeek;
import java.time.LocalTime;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityCreateDto;
import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityResponseDto;
import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityUpdateDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.AvailabilityService;

@RestController
@RequestMapping(value = "/availability")
@CrossOrigin(origins = { "http://localhost:5173", "https://conferenceroomsystem.vercel.app" })
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    /**
     * Create room availability schedule
     * POST /availability/create
     */
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createAvailability(@RequestBody AvailabilityCreateDto createDto,
            @AuthenticationPrincipal User admin) {
        try {
            AvailabilityResponseDto availability = availabilityService.createAvailability(createDto, admin);
            return new ResponseEntity<>(availability, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create availability: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update room availability schedule
     * PUT /availability/update/{availabilityId}
     */
    @PutMapping(value = "/update/{availabilityId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateAvailability(@PathVariable UUID availabilityId,
            @RequestBody AvailabilityUpdateDto updateDto,
            @AuthenticationPrincipal User admin) {
        try {
            AvailabilityResponseDto availability = availabilityService.updateAvailability(availabilityId, updateDto,
                    admin);
            return new ResponseEntity<>(availability, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update availability: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete room availability schedule
     * DELETE /availability/delete/{availabilityId}
     */
    @DeleteMapping(value = "/delete/{availabilityId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteAvailability(@PathVariable UUID availabilityId,
            @AuthenticationPrincipal User admin) {
        try {
            availabilityService.deleteAvailability(availabilityId, admin);
            return new ResponseEntity<>("Availability deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete availability: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get room availability schedule with pagination
     * GET /availability/room/{roomId}
     */
    @GetMapping(value = "/room/{roomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getRoomAvailability(@PathVariable UUID roomId,
            Pageable pageable) {
        try {
            Page<AvailabilityResponseDto> availability = availabilityService.getRoomAvailability(roomId, pageable);
            return new ResponseEntity<>(availability, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch room availability: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available days for a room within a time range
     * GET
     * /availability/room/{roomId}/available-days?dayOfWeek=MONDAY&startTime=09:00&endTime=17:00
     */
    @GetMapping(value = "/room/{roomId}/available-days", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAvailableDays(@PathVariable UUID roomId,
            @RequestParam DayOfWeek dayOfWeek,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime) {
        try {
            List<DayOfWeek> availableDays = availabilityService.getAvailableDays(roomId, dayOfWeek, startTime, endTime);
            return new ResponseEntity<>(availableDays, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch available days: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}