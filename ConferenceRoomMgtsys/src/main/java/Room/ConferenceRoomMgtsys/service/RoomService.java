package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.room.RoomCreateDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomAccessUpdateDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomResponseDto;
import Room.ConferenceRoomMgtsys.dto.room.RoomSearchDto;
import Room.ConferenceRoomMgtsys.model.Room;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.repository.RoomRepository;
import Room.ConferenceRoomMgtsys.repository.OrganizationRepository;
import Room.ConferenceRoomMgtsys.repository.BookingRepository;
import Room.ConferenceRoomMgtsys.repository.AvailabilityRepository;
import Room.ConferenceRoomMgtsys.repository.RoomCommunicationRepository;
import Room.ConferenceRoomMgtsys.enums.RoomAccessLevel;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;
import Room.ConferenceRoomMgtsys.model.Availability;
import Room.ConferenceRoomMgtsys.model.RoomCommunication;
import Room.ConferenceRoomMgtsys.model.Booking;

@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);

    private final RoomRepository roomRepository;
    private final OrganizationRepository organizationRepository;
    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final RoomCommunicationRepository roomCommunicationRepository;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String baseUploadDir;

    private Path roomsDir;

    public RoomService(RoomRepository roomRepository,
            OrganizationRepository organizationRepository,
            BookingRepository bookingRepository,
            AvailabilityRepository availabilityRepository,
            RoomCommunicationRepository roomCommunicationRepository,
            ObjectMapper objectMapper) {
        this.roomRepository = roomRepository;
        this.organizationRepository = organizationRepository;
        this.bookingRepository = bookingRepository;
        this.availabilityRepository = availabilityRepository;
        this.roomCommunicationRepository = roomCommunicationRepository;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        this.roomsDir = Paths.get(baseUploadDir).resolve("rooms");
        try {
            Files.createDirectories(roomsDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory for room images", e);
        }
    }

    @Transactional
    public RoomResponseDto createRoom(RoomCreateDto createDto, Organization organization, List<MultipartFile> images) {
        // Validate organization
        if (organization == null) {
            throw new IllegalArgumentException("Organization is required");
        }

        // Check if room name already exists in organization
        if (roomRepository.findByOrganizationAndName(organization, createDto.getName()).isPresent()) {
            throw new IllegalArgumentException("Room with this name already exists in organization");
        }

        // Create room with PUBLIC access level
        Room room = new Room();
        room.setName(createDto.getName());
        room.setDescription(createDto.getDescription());
        room.setOrganization(organization);
        room.setCapacity(createDto.getCapacity());
        room.setLocation(createDto.getLocation());
        room.setFloor(createDto.getFloor());
        room.setAmenities(createDto.getAmenities());
        room.setEquipment(createDto.getEquipment());
        room.setAccessLevel(RoomAccessLevel.PUBLIC); // Set to PUBLIC for any user access
        room.setAllowedOrganizations(null); // No need for allowed organizations since it's PUBLIC

        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    try {
                        // Create organization-specific directory within the rooms directory
                        Path orgDir = this.roomsDir.resolve(organization.getId().toString());
                        if (!Files.exists(orgDir)) {
                            Files.createDirectories(orgDir);
                        }

                        // Generate unique filename
                        String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                        Path filePath = orgDir.resolve(filename);

                        // Save the file
                        Files.copy(image.getInputStream(), filePath);

                        // Add the relative URL to the list
                        imageUrls.add("uploads/rooms/" + organization.getId() + "/" + filename);
                    } catch (IOException e) {
                        logger.error("Failed to upload image: {}", e.getMessage(), e);
                        throw new RuntimeException("Failed to upload image: " + e.getMessage());
                    }
                }
            }
            try {
                room.setImages(objectMapper.writeValueAsString(imageUrls));
            } catch (IOException e) {
                logger.error("Failed to serialize image URLs: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to serialize image URLs: " + e.getMessage());
            }
        }

        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    @Transactional
    public RoomResponseDto updateRoomAccess(RoomAccessUpdateDto updateDto, Organization organization) {
        // Find room by ID
        Room room = roomRepository.findById(updateDto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Update access level
        room.setAccessLevel(updateDto.getAccessLevel());

        // Update allowed organizations if ORG_ONLY
        if (updateDto.getAccessLevel() == RoomAccessLevel.ORG_ONLY) {
            Set<String> allowedOrgIds = updateDto.getAllowedOrganizationIds();
            if (allowedOrgIds != null && !allowedOrgIds.isEmpty()) {
                Set<Organization> organizations = new HashSet<>();
                for (String orgId : allowedOrgIds) {
                    Organization org = organizationRepository.findById(UUID.fromString(orgId))
                            .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + orgId));
                    organizations.add(org);
                }
                room.setAllowedOrganizations(organizations);
            } else {
                room.setAllowedOrganizations(null);
            }
        } else {
            room.setAllowedOrganizations(null);
        }

        Room savedRoom = roomRepository.save(room);
        return convertToDto(savedRoom);
    }

    @Transactional(readOnly = true)
    public Page<RoomResponseDto> searchRooms(RoomSearchDto searchDto, Pageable pageable) {
        Page<Room> rooms = roomRepository.searchByNameDescriptionOrLocation(searchDto.getSearchTerm(), pageable);
        return rooms.map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<RoomResponseDto> searchRoomsByOrganization(RoomSearchDto searchDto, Organization organization,
            Pageable pageable) {
        Page<Room> rooms = roomRepository.searchByOrganizationAndNameDescriptionOrLocation(organization,
                searchDto.getSearchTerm(), pageable);
        return rooms.map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDto> getAvailableRooms(Organization organization,
            LocalDateTime startTime,
            LocalDateTime endTime) {
        List<Room> rooms = roomRepository.findAvailableRooms(organization, startTime, endTime);
        return rooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // METHOD FOR BOOKING CONTROLLER - Returns Room entity
    @Transactional(readOnly = true)
    public Room getRoomById(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
    }

    // NEW METHOD FOR ROOM CONTROLLER - Returns DTO
    @Transactional(readOnly = true)
    public RoomResponseDto getRoomDtoById(UUID roomId) {
        Room room = getRoomById(roomId);
        return convertToDto(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDto> getAllRoomsForUserRole(User currentUser) {
        List<Room> rooms;
        if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
            logger.info("Fetching all rooms for SYSTEM_ADMIN.");
            rooms = roomRepository.findAll();
        } else if (currentUser.getRole() == UserRole.ADMIN) {
            if (currentUser.getOrganization() == null) {
                logger.warn("Admin user not associated with an organization when trying to fetch rooms.");
                throw new RuntimeException("Admin is not associated with an organization.");
            }
            logger.info("Fetching rooms for ADMIN's organization ID: {}", currentUser.getOrganization().getId());
            rooms = roomRepository.findAllByOrganization(currentUser.getOrganization());
        } else { // Regular USER role
            logger.info("Fetching all rooms for regular USER across all organizations.");
            rooms = roomRepository.findAll(); // Allow regular users to see all rooms
        }

        logger.info("Found {} rooms.", rooms.size());
        return rooms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // Delete all communications associated with the room
        List<RoomCommunication> communications = roomCommunicationRepository.findByBooking_Room(room);
        if (communications != null && !communications.isEmpty()) {
            roomCommunicationRepository.deleteAll(communications);
        }

        // Delete all bookings associated with the room
        List<Booking> bookings = bookingRepository.findByRoom(room);
        if (bookings != null && !bookings.isEmpty()) {
            bookingRepository.deleteAll(bookings);
        }

        // Delete all availability associated with the room
        List<Availability> availabilities = availabilityRepository.findByRoom(room);
        if (availabilities != null && !availabilities.isEmpty()) {
            availabilityRepository.deleteAll(availabilities);
        }

        roomRepository.delete(room);
    }

    @Transactional
    public RoomResponseDto updateRoom(UUID roomId, RoomCreateDto updateDto, Organization organization,
            List<MultipartFile> newImages) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with ID: " + roomId));

        // Basic fields update
        room.setName(updateDto.getName());
        room.setDescription(updateDto.getDescription());
        room.setCapacity(updateDto.getCapacity());
        room.setLocation(updateDto.getLocation());
        room.setFloor(updateDto.getFloor());
        room.setAmenities(updateDto.getAmenities());
        room.setEquipment(updateDto.getEquipment());

        // Handle images update
        if (newImages != null && !newImages.isEmpty()) {
            // Delete old images first
            if (room.getImages() != null && !room.getImages().isEmpty()) {
                try {
                    List<String> oldImageUrls = objectMapper.readValue(room.getImages(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {
                            });
                    for (String imageUrl : oldImageUrls) {
                        if (imageUrl != null && imageUrl.startsWith("uploads/")) {
                            try {
                                // Construct the full path correctly
                                Path imagePath = Paths.get(baseUploadDir).resolve(imageUrl.substring(8)); // Remove
                                                                                                          // "uploads/"
                                                                                                          // prefix
                                if (Files.exists(imagePath)) {
                                    Files.delete(imagePath);
                                    logger.info("Deleted old image file: {}", imagePath);
                                } else {
                                    logger.warn("Old image file not found for deletion: {}", imagePath);
                                }
                            } catch (Exception e) {
                                logger.warn("Failed to delete old image file {}: {}", imageUrl, e.getMessage());
                            }
                        }
                    }
                } catch (IOException e) {
                    logger.error("Failed to parse old images for room {}: {}", roomId, e.getMessage());
                }
            }

            // Upload new images
            List<String> newImageUrls = new ArrayList<>();
            for (MultipartFile image : newImages) {
                if (!image.isEmpty()) {
                    try {
                        Path orgDir = this.roomsDir.resolve(organization.getId().toString());
                        if (!Files.exists(orgDir)) {
                            Files.createDirectories(orgDir);
                        }
                        String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                        Path filePath = orgDir.resolve(filename);
                        Files.copy(image.getInputStream(), filePath);
                        newImageUrls.add("uploads/rooms/" + organization.getId() + "/" + filename);
                    } catch (IOException e) {
                        logger.error("Failed to upload new image: {}", e.getMessage(), e);
                        throw new RuntimeException("Failed to upload new image: " + e.getMessage());
                    }
                }
            }
            try {
                room.setImages(objectMapper.writeValueAsString(newImageUrls));
            } catch (IOException e) {
                logger.error("Failed to serialize new image URLs: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to serialize new image URLs: " + e.getMessage());
            }
        } else if (newImages != null && newImages.isEmpty()) {
            // If newImages is provided but empty, it means no images are to be associated
            // So delete all existing images
            if (room.getImages() != null && !room.getImages().isEmpty()) {
                try {
                    List<String> oldImageUrls = objectMapper.readValue(room.getImages(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {
                            });
                    for (String imageUrl : oldImageUrls) {
                        if (imageUrl != null && imageUrl.startsWith("uploads/")) {
                            try {
                                Path imagePath = Paths.get(baseUploadDir).resolve(imageUrl.substring(8));
                                if (Files.exists(imagePath)) {
                                    Files.delete(imagePath);
                                    logger.info("Deleted old image file (no new images provided): {}", imagePath);
                                }
                            } catch (Exception e) {
                                logger.warn("Failed to delete old image file {}: {}", imageUrl, e.getMessage());
                            }
                        }
                    }
                } catch (IOException e) {
                    logger.error("Failed to parse old images when no new images provided for room {}: {}", roomId,
                            e.getMessage());
                }
            }
            room.setImages("[]"); // Set to empty JSON array
        }

        Room updatedRoom = roomRepository.save(room);
        return convertToDto(updatedRoom);
    }

    private RoomResponseDto convertToDto(Room room) {
        RoomResponseDto dto = new RoomResponseDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setDescription(room.getDescription());
        dto.setOrganizationId(room.getOrganization().getId());
        dto.setOrganizationName(room.getOrganization().getName());
        dto.setCapacity(room.getCapacity());
        dto.setLocation(room.getLocation());
        dto.setFloor(room.getFloor());
        dto.setAccessLevel(room.getAccessLevel());

        // Set additional fields for RoomResponseDto
        dto.setActive(room.getIsActive() != null ? room.getIsActive() : true);
        dto.setAvailable(dto.isActive()); // Set based on active status
        dto.setTotalBookingsToday(0); // Default to 0, implement actual count if needed

        // Set optional fields if they exist in your Room entity
        // Note: These might be null if your Room entity doesn't have these fields yet
        try {
            if (room.getAmenities() != null) {
                dto.setAmenities(room.getAmenities());
            }
        } catch (Exception e) {
            // Field doesn't exist in Room entity yet
            dto.setAmenities("");
        }

        try {
            if (room.getEquipment() != null) {
                dto.setEquipment(room.getEquipment());
            }
        } catch (Exception e) {
            dto.setEquipment("");
        }

        // Correctly set images as a JSON string
        try {
            if (room.getImages() != null && !room.getImages().isEmpty()) {
                // If images are stored as a comma-separated string, convert it to JSON array
                // string
                // This handles legacy data or incorrect previous storage
                if (!room.getImages().startsWith("[")) {
                    List<String> imageUrls = List.of(room.getImages().split(","));
                    dto.setImages(objectMapper.writeValueAsString(imageUrls));
                } else {
                    dto.setImages(room.getImages()); // Already a JSON array string
                }
            } else {
                dto.setImages("[]"); // Default to empty JSON array if no images
            }
        } catch (Exception e) {
            logger.error("Error parsing images from room entity: {}", e.getMessage(), e);
            dto.setImages("[]"); // Default to empty JSON array on error
        }

        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        return dto;
    }
}