package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.organization.OrganizationCreateDto;
import Room.ConferenceRoomMgtsys.dto.organization.OrganizationResponseDto;
import Room.ConferenceRoomMgtsys.model.*;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.repository.*;
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
import java.util.List;
import java.util.UUID;
import jakarta.annotation.PostConstruct;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final RoomCommunicationRepository roomCommunicationRepository;

    @Value("${file.upload-dir}")
    private String baseUploadDir;

    private Path organizationLogosDir;

    public OrganizationService(OrganizationRepository organizationRepository,
            UserRepository userRepository,
            RoomRepository roomRepository,
            BookingRepository bookingRepository,
            AvailabilityRepository availabilityRepository,
            RoomCommunicationRepository roomCommunicationRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.availabilityRepository = availabilityRepository;
        this.roomCommunicationRepository = roomCommunicationRepository;
    }

    @PostConstruct
    public void init() {
        this.organizationLogosDir = Paths.get(baseUploadDir).resolve("organizations");
        try {
            Files.createDirectories(organizationLogosDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory for organization logos", e);
        }
    }

    private String sanitizeFilename(String filename) {
        // Remove any path components
        String name = filename.substring(filename.lastIndexOf('/') + 1);
        // Replace spaces and special characters with underscores
        return name.replaceAll("[^a-zA-Z0-9.-]", "_");
    }

    @Transactional
    public Organization createOrganization(OrganizationCreateDto createDto, MultipartFile logo) {
        // Check if organization exists
        if (organizationRepository.existsByOrganizationCode(createDto.getOrganizationCode())) {
            throw new RuntimeException("Organization with this code already exists");
        }

        // Create organization
        Organization organization = new Organization();
        organization.setName(createDto.getName());
        organization.setOrganizationCode(createDto.getOrganizationCode());
        organization.setDescription(createDto.getDescription());
        organization.setAddress(createDto.getAddress());
        organization.setPhone(createDto.getPhone());
        organization.setEmail(createDto.getEmail());
        organization.setIsActive(true);

        // Handle logo upload
        if (logo != null && !logo.isEmpty()) {
            try {
                // Generate unique filename with sanitized original filename
                String sanitizedFilename = sanitizeFilename(logo.getOriginalFilename());
                String filename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
                Path filePath = this.organizationLogosDir.resolve(filename);

                // Save the file
                Files.copy(logo.getInputStream(), filePath);

                // Set the logo URL, making sure to use forward slashes for the URL
                organization.setLogoUrl("uploads/organizations/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload logo: " + e.getMessage());
            }
        }

        // Save organization
        organization = organizationRepository.save(organization);

        return organization;
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponseDto> getAllOrganizations() {
        return organizationRepository.findByIsActive(true)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public User createFirstAdminForOrganization(String organizationCode, User systemAdmin) {
        // Only system admin can create first admin
        if (!systemAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("Only system admin can create first admin");
        }

        // Find organization
        Organization organization = organizationRepository.findByOrganizationCode(organizationCode)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // Create first admin
        User firstAdmin = new User();
        firstAdmin.setFirstName(organization.getName());
        firstAdmin.setLastName("Admin");
        firstAdmin.setEmail(organization.getEmail());
        firstAdmin.setRole(UserRole.ADMIN);
        firstAdmin.setApprovalStatus(ApprovalStatus.APPROVED);
        firstAdmin.setIsApproved(true);
        firstAdmin.setOrganization(organization);

        // Save first admin
        return userRepository.save(firstAdmin);
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponseDto> searchOrganizations(String searchTerm, Pageable pageable) {
        return organizationRepository.searchByNameDescriptionOrCode(searchTerm, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public OrganizationResponseDto getOrganizationById(UUID id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        return convertToDto(organization);
    }

    // NEW METHOD ADDED FOR BOOKING CONTROLLER
    @Transactional(readOnly = true)
    public Organization getOrganizationEntityById(UUID organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
    }

    @Transactional
    public Organization updateOrganization(UUID id, OrganizationCreateDto updateDto, MultipartFile logo) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        // Check if organization code is being changed and if it already exists
        if (!organization.getOrganizationCode().equals(updateDto.getOrganizationCode()) &&
                organizationRepository.existsByOrganizationCode(updateDto.getOrganizationCode())) {
            throw new RuntimeException("Organization with this code already exists");
        }

        organization.setName(updateDto.getName());
        organization.setOrganizationCode(updateDto.getOrganizationCode());
        organization.setDescription(updateDto.getDescription());
        organization.setAddress(updateDto.getAddress());
        organization.setPhone(updateDto.getPhone());
        organization.setEmail(updateDto.getEmail());

        // Handle logo upload
        if (logo != null && !logo.isEmpty()) {
            try {
                // Delete old logo if it's a local file and exists
                if (organization.getLogoUrl() != null && !organization.getLogoUrl().isBlank()
                        && !organization.getLogoUrl().startsWith("http")) {
                    String oldLogoPath = organization.getLogoUrl().replace("uploads/organizations/", "");
                    Path oldLogoFile = this.organizationLogosDir.resolve(oldLogoPath);
                    Files.deleteIfExists(oldLogoFile);
                }

                // Generate unique filename with sanitized original filename
                String sanitizedFilename = sanitizeFilename(logo.getOriginalFilename());
                String filename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
                Path filePath = this.organizationLogosDir.resolve(filename);

                // Save the file
                Files.copy(logo.getInputStream(), filePath);

                // Set the logo URL
                organization.setLogoUrl("uploads/organizations/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload logo: " + e.getMessage());
            }
        }

        return organizationRepository.save(organization);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        // Delete the logo file if it exists and is a local file
        if (organization.getLogoUrl() != null && !organization.getLogoUrl().isBlank()
                && !organization.getLogoUrl().startsWith("http")) {
            try {
                String logoPath = organization.getLogoUrl().replace("uploads/organizations/", "");
                Path logoFile = this.organizationLogosDir.resolve(logoPath);
                Files.deleteIfExists(logoFile);
            } catch (IOException e) {
                // Log the exception but don't rethrow, as we want to proceed with deleting the
                // organization
                System.err.println("Failed to delete organization logo: " + e.getMessage());
            }
        }

        // Find all rooms for the organization
        List<Room> rooms = roomRepository.findAllByOrganization(organization);
        for (Room room : rooms) {
            // For each room, delete all related entities
            List<Booking> bookings = bookingRepository.findByRoom(room);
            if (bookings != null && !bookings.isEmpty()) {
                // Must delete communications before bookings due to foreign key constraints
                List<RoomCommunication> communications = roomCommunicationRepository.findByBooking_Room(room);
                if (communications != null && !communications.isEmpty()) {
                    roomCommunicationRepository.deleteAll(communications);
                }
                bookingRepository.deleteAll(bookings);
            }

            List<Availability> availabilities = availabilityRepository.findByRoom(room);
            if (availabilities != null && !availabilities.isEmpty()) {
                availabilityRepository.deleteAll(availabilities);
            }
        }
        // Now delete all rooms
        roomRepository.deleteAll(rooms);

        // Delete all users associated with this organization
        List<User> users = userRepository.findByOrganization(organization, Pageable.unpaged()).getContent();
        userRepository.deleteAll(users);

        // Delete the organization
        organizationRepository.delete(organization);
    }

    @Transactional(readOnly = true)
    public Page<OrganizationResponseDto> getActiveOrganizations(Pageable pageable) {
        return organizationRepository.findByIsActive(true, pageable)
                .map(this::convertToDto);
    }

    public OrganizationResponseDto convertToDto(Organization organization) {
        OrganizationResponseDto dto = new OrganizationResponseDto();
        dto.setId(organization.getId());
        dto.setName(organization.getName());
        dto.setOrganizationCode(organization.getOrganizationCode());
        dto.setDescription(organization.getDescription());
        dto.setAddress(organization.getAddress());
        dto.setPhone(organization.getPhone());
        dto.setEmail(organization.getEmail());
        dto.setLogoUrl(organization.getLogoUrl());
        dto.setTotalUsers(organizationRepository.countActiveUsersByOrganization(organization).intValue());
        dto.setTotalRooms(organizationRepository.countActiveRoomsByOrganization(organization).intValue());
        return dto;
    }
}