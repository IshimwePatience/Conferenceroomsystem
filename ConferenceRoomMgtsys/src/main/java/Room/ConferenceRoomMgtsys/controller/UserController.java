package Room.ConferenceRoomMgtsys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

import Room.ConferenceRoomMgtsys.dto.admin.AdminCreationDto;
import Room.ConferenceRoomMgtsys.dto.auth.UserRegistrationDto;
import Room.ConferenceRoomMgtsys.dto.auth.SystemAdminRegistrationDto;
import Room.ConferenceRoomMgtsys.dto.auth.UserRegistrationResponseDto;
import Room.ConferenceRoomMgtsys.dto.user.UserResponseDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.UserService;
import Room.ConferenceRoomMgtsys.dto.user.UserStatusRequest;
import Room.ConferenceRoomMgtsys.dto.user.UserApprovalRequest;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping(value = "/user")
@CrossOrigin(origins = { "http://localhost:5173", "http://197.243.104.5/conferenceroomsystem","https://conferenceroomsystem.vercel.app" })
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/register-system-admin", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerSystemAdmin(@RequestBody SystemAdminRegistrationDto registrationDto) {
        try {
            User systemAdmin = userService.registerSystemAdmin(registrationDto);
            return new ResponseEntity<>(systemAdmin, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to register system admin: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationDto registrationDto,
            @AuthenticationPrincipal User currentUser) {
        try {
            User newUser = userService.registerUser(registrationDto, currentUser);
            UserRegistrationResponseDto response = new UserRegistrationResponseDto();
            response.setMessage("Registration successful");
            response.setStatus("PENDING");
            response.setNextStep("Wait for admin approval");
            response.setSuccess(true);
            response.setOrganizationName(newUser.getOrganization().getName());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to register user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/create-admin", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createAdmin(@RequestBody AdminCreationDto creationDto,
            @AuthenticationPrincipal User currentAdmin) {
        try {
            User newAdmin = userService.createAdmin(creationDto, currentAdmin);
            return new ResponseEntity<>(newAdmin, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to create admin: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{userId}/status", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable UUID userId, @RequestBody UserStatusRequest request,
            @AuthenticationPrincipal User currentAdmin) {
        try {
            User updatedUser = userService.updateUserActiveStatus(userId, request.getIsActive(), currentAdmin);
            return new ResponseEntity<>(UserResponseDto.fromUser(updatedUser), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update user status: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/pending-users", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> getPendingUsers(@AuthenticationPrincipal User currentAdmin) {
        try {
            List<User> pendingUsers = userService.getPendingUsers(currentAdmin);
            List<UserResponseDto> dtos = pendingUsers.stream()
                    .map(UserResponseDto::fromUser)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch pending users: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String organizationId,
            @RequestParam(required = false) String role,
            @AuthenticationPrincipal User currentUser) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.getAllUsers(search, organizationId, role, pageable, currentUser);

            // Convert User entities to UserResponseDto
            Page<UserResponseDto> userDtos = users.map(UserResponseDto::fromUser);

            return ResponseEntity.ok(userDtos);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to fetch all users: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody User updatedUser,
            @AuthenticationPrincipal User currentUser) {
        try {
            User user = userService.updateUser(id, updatedUser, currentUser);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        try {
            userService.deleteUser(id, currentUser);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/approve", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> approveUser(@RequestBody UserApprovalRequest request,
            @AuthenticationPrincipal User currentUser) {
        try {
            userService.approveUser(request.getUserId(), request.getApprove(), request.getRole(), currentUser);
            return ResponseEntity.ok().body("User approval updated successfully.");
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update user approval status: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}