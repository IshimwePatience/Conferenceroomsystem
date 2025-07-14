package Room.ConferenceRoomMgtsys.controller;

import Room.ConferenceRoomMgtsys.dto.organization.OrganizationCreateDto;
import Room.ConferenceRoomMgtsys.dto.organization.OrganizationResponseDto;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.service.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/organization")
@CrossOrigin(origins = "http://localhost:5173")
public class OrganizationController {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationController.class);

    @Autowired
    private OrganizationService organizationService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createOrganization(
            @RequestParam("name") String name,
            @RequestParam("organizationCode") String organizationCode,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam("email") String email,
            @RequestParam(value = "logo", required = false) MultipartFile logo) {
        try {
            OrganizationCreateDto createDto = new OrganizationCreateDto();
            createDto.setName(name);
            createDto.setOrganizationCode(organizationCode);
            createDto.setDescription(description);
            createDto.setAddress(address);
            createDto.setPhone(phone);
            createDto.setEmail(email);

            Organization newOrganization = organizationService.createOrganization(createDto, logo);
            return new ResponseEntity<>(organizationService.convertToDto(newOrganization), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            logger.error("Error creating organization", e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<OrganizationResponseDto>> getAllOrganizations() {
        List<OrganizationResponseDto> organizations = organizationService.getAllOrganizations();
        return ResponseEntity.ok(organizations);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateOrganization(
            @PathVariable UUID id,
            @RequestParam("name") String name,
            @RequestParam("organizationCode") String organizationCode,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam("email") String email,
            @RequestParam(value = "logo", required = false) MultipartFile logo) {
        try {
            OrganizationCreateDto updateDto = new OrganizationCreateDto();
            updateDto.setName(name);
            updateDto.setOrganizationCode(organizationCode);
            updateDto.setDescription(description);
            updateDto.setAddress(address);
            updateDto.setPhone(phone);
            updateDto.setEmail(email);

            Organization updatedOrganization = organizationService.updateOrganization(id, updateDto, logo);
            return ResponseEntity.ok(organizationService.convertToDto(updatedOrganization));
        } catch (IllegalArgumentException e) {
            logger.warn("Warning updating organization with ID: {}. Reason: {}", id, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.error("Error updating organization with ID: {}", id, e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable UUID id) {
        try {
            organizationService.deleteOrganization(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            logger.warn("Warning deleting organization with ID: {}. Reason: {}", id, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            logger.error("Error deleting organization with ID: {}", id, e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}