package Room.ConferenceRoomMgtsys.controller;

import Room.ConferenceRoomMgtsys.dto.auth.UserRegistrationDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = { "http://localhost:5173", "http://197.243.104.5/conferenceroomsystem","https://conferenceroomsystem.vercel.app" })
public class RegistrationController {

    private final UserService userService;

    public RegistrationController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody UserRegistrationDto registrationDto,
            @AuthenticationPrincipal User currentUser) {
        Map<String, String> response = new HashMap<>();

        if (isInvalid(registrationDto)) {
            response.put("error", "First name, last name, email, password, and organization are required.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (!isValidEmail(registrationDto.getEmail())) {
            response.put("error", "Invalid email format.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (userService.isEmailTaken(registrationDto.getEmail())) {
            response.put("error", "Email already registered.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        userService.registerUser(registrationDto, currentUser);

        response.put("message", "User registered successfully. Waiting for approval.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private boolean isInvalid(UserRegistrationDto request) {
        return request.getFirstName() == null || request.getFirstName().isEmpty() ||
                request.getLastName() == null || request.getLastName().isEmpty() ||
                request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getPassword() == null || request.getPassword().isEmpty() ||
                request.getOrganizationName() == null || request.getOrganizationName().isEmpty();
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return Pattern.compile(emailRegex).matcher(email).matches();
    }
}