package Room.ConferenceRoomMgtsys.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.multipart.MultipartFile;

import Room.ConferenceRoomMgtsys.dto.room.RoomAccessUpdateDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomCreateDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomResponseDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomSearchDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.RoomService;

@RestController
@RequestMapping(value = "/room")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    @Autowired
    private RoomService roomService;

    /**
     * Create a new room
     * POST /room/create
     */
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createRoom(@RequestParam("name") String name,
            @RequestParam("location") String location,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "floor", required = false) String floor,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "equipment", required = false) String equipment,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User user) {
        try {
            RoomCreateDto createDto = new RoomCreateDto();
            createDto.setName(name);
            createDto.setLocation(location);
            createDto.setCapacity(capacity);
            createDto.setDescription(description);
            createDto.setFloor(floor);
            createDto.setAmenities(amenities);
            createDto.setEquipment(equipment);

            // Use the authenticated user's organization
            RoomResponseDto room = roomService.createRoom(createDto, user.getOrganization(), images);
            return new ResponseEntity<>(room, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create room: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a room
     * PUT /room/{roomId}
     */
    @PutMapping(value = "/{roomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateRoom(@PathVariable UUID roomId,
            @RequestParam("name") String name,
            @RequestParam("location") String location,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "floor", required = false) String floor,
            @RequestParam(value = "amenities", required = false) String amenities,
            @RequestParam(value = "equipment", required = false) String equipment,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User user) {
        try {
            // Log the incoming request for debugging
            System.out.println("Updating room with ID: " + roomId);
            System.out.println("Name: " + name);
            System.out.println("Location: " + location);
            System.out.println("Capacity: " + capacity);
            System.out.println("Description: " + description);
            System.out.println("Floor: " + floor);
            System.out.println("Amenities: " + amenities);
            System.out.println("Equipment: " + equipment);
            System.out.println("Images count: " + (images != null ? images.size() : 0));

            RoomCreateDto updateDto = new RoomCreateDto();
            updateDto.setName(name);
            updateDto.setLocation(location);
            updateDto.setCapacity(capacity);
            updateDto.setDescription(description);
            updateDto.setFloor(floor);
            updateDto.setAmenities(amenities);
            updateDto.setEquipment(equipment);

            RoomResponseDto updatedRoom = roomService.updateRoom(roomId, updateDto, user.getOrganization(), images);
            return new ResponseEntity<>(updatedRoom, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in updateRoom: " + e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Exception in updateRoom: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Failed to update room: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update room access settings
     * PUT /room/access/update
     */
    @PutMapping(value = "/access/update", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateRoomAccess(@RequestBody RoomAccessUpdateDto updateDto,
            @AuthenticationPrincipal User user) {
        try {
            // Use the authenticated user's organization
            RoomResponseDto room = roomService.updateRoomAccess(updateDto, user.getOrganization());
            return new ResponseEntity<>(room, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update room access: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search rooms with pagination
     * GET /room/search?searchTerm=...
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<RoomResponseDto>> searchRooms(
            @RequestParam(required = false) String searchTerm,
            Pageable pageable) {
        try {
            RoomSearchDto searchDto = new RoomSearchDto();
            searchDto.setSearchTerm(searchTerm);

            Page<RoomResponseDto> rooms = roomService.searchRooms(searchDto, pageable);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Page.empty(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available rooms for a time period
     * GET /room/available?startTime=2024-01-01T09:00:00&endTime=2024-01-01T17:00:00
     */
    @GetMapping(value = "/available", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RoomResponseDto>> getAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @AuthenticationPrincipal User user) {
        try {
            // Use the authenticated user's organization
            List<RoomResponseDto> rooms = roomService.getAvailableRooms(user.getOrganization(), startTime, endTime);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get room by ID
     * GET /room/{roomId}
     */
    @GetMapping(value = "/{roomId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getRoomById(@PathVariable UUID roomId) {
        try {
            RoomResponseDto room = roomService.getRoomDtoById(roomId);
            return new ResponseEntity<>(room, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch room: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all rooms for current user's organization
     * GET /room/organization
     */
    @GetMapping(value = "/organization", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<RoomResponseDto>> getOrganizationRooms(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        try {
            // Use search functionality with empty search term to get all rooms for the
            // user's organization
            RoomSearchDto searchDto = new RoomSearchDto();
            searchDto.setSearchTerm(""); // Empty search returns all

            Page<RoomResponseDto> rooms = roomService.searchRoomsByOrganization(searchDto, user.getOrganization(),
                    pageable);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Page.empty(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available rooms with capacity filter
     * GET /room/available/capacity?startTime=...&endTime=...&minCapacity=10
     */
    @GetMapping(value = "/available/capacity", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RoomResponseDto>> getAvailableRoomsWithCapacity(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "1") Integer minCapacity,
            @AuthenticationPrincipal User user) {
        try {
            // Get all available rooms and filter by capacity
            List<RoomResponseDto> rooms = roomService.getAvailableRooms(user.getOrganization(), startTime, endTime)
                    .stream()
                    .filter(room -> room.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get all rooms for the current user's role
     * GET /room/all
     */
    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RoomResponseDto>> getAllRooms(@AuthenticationPrincipal User user) {
        try {
            List<RoomResponseDto> rooms = roomService.getAllRoomsForUserRole(user);
            return new ResponseEntity<>(rooms, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(List.of(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a room by ID
     * DELETE /room/{roomId}
     */
    @DeleteMapping(value = "/{roomId}")
    public ResponseEntity<?> deleteRoom(@PathVariable UUID roomId) {
        try {
            roomService.deleteRoom(roomId);
            return new ResponseEntity<>("Room deleted successfully", HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete room: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}