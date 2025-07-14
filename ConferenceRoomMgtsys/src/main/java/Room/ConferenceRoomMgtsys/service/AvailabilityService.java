package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityCreateDto;
import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityResponseDto;
import Room.ConferenceRoomMgtsys.dto.availability.AvailabilityUpdateDto;
import Room.ConferenceRoomMgtsys.model.Availability;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.AvailabilityRepository;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {
    
    private final AvailabilityRepository availabilityRepository;
    private final RoomRepository roomRepository;
    
    public AvailabilityService(AvailabilityRepository availabilityRepository,
                            RoomRepository roomRepository) {
        this.availabilityRepository = availabilityRepository;
        this.roomRepository = roomRepository;
    }
    
    @Transactional
    public AvailabilityResponseDto createAvailability(AvailabilityCreateDto createDto, User admin) {
        // Validate admin has permission
        if (!admin.getOrganization().equals(createDto.getRoom().getOrganization())) {
            throw new IllegalArgumentException("Only admins from the room's organization can create availability");
        }
        
        // Check for existing availability
        if (availabilityRepository.existsByRoomAndDayOfWeek(createDto.getRoom(), createDto.getDayOfWeek())) {
            throw new IllegalArgumentException("Availability already exists for this day");
        }
        
        // Create and save availability
        Availability availability = availabilityRepository.save(createDto.toEntity());
        return convertToDto(availability);
    }

    @Transactional
    public AvailabilityResponseDto updateAvailability(UUID availabilityId, AvailabilityUpdateDto updateDto, User admin) {
        // Validate admin has permission
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found"));
        
        if (!admin.getOrganization().equals(availability.getRoom().getOrganization())) {
            throw new IllegalArgumentException("Only admins from the room's organization can update availability");
        }
        
        // Update and save availability
        updateDto.updateEntity(availability);
        return convertToDto(availabilityRepository.save(availability));
    }

    @Transactional
    public void deleteAvailability(UUID availabilityId, User admin) {
        // Validate admin has permission
        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found"));
        
        if (!admin.getOrganization().equals(availability.getRoom().getOrganization())) {
            throw new IllegalArgumentException("Only admins from the room's organization can delete availability");
        }
        
        // Delete availability
        availabilityRepository.delete(availability);
    }

    @Transactional(readOnly = true)
    public Page<AvailabilityResponseDto> getRoomAvailability(UUID roomId, Pageable pageable) {
        // Get all availability for this room
        return availabilityRepository.findByRoom(roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found")), pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<DayOfWeek> getAvailableDays(UUID roomId, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime) {
        // Get available days for this room and time range
        return availabilityRepository.findAvailableSlotsInTimeRange(
            roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found")),
            dayOfWeek,
            startTime,
            endTime
        ).stream()
            .map(Availability::getDayOfWeek)
            .distinct()
            .collect(Collectors.toList());
    }

    private AvailabilityResponseDto convertToDto(Availability availability) {
        return AvailabilityResponseDto.fromEntity(availability);
    }
}
