package Room.ConferenceRoomMgtsys.controller;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Room.ConferenceRoomMgtsys.jwt.JwtUtil;
import Room.ConferenceRoomMgtsys.dto.auth.*;
import Room.ConferenceRoomMgtsys.dto.base.BaseResponseDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.service.EmailService;
import Room.ConferenceRoomMgtsys.service.AuthService;
import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.enums.AuthProvider;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:5173",  "http://10.8.150.139:8090","https://conferenceroomsystem.vercel.app" })
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Invalid email or password"));
            }

            // Check if user is active (not deactivated by admin)
            if (user.getIsActive() != null && !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse(
                                "Your account has been deactivated. Please contact your administrator."));
            }

            // Check if user is approved (pending approval)
            if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Your account is pending approval. Please wait for admin approval."));
            }

            // Check if account is locked
            if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Account is temporarily locked. Please try again later."));
            }

            // If 2FA code provided, verify it directly
            if (request.getTwoFactorCode() != null && !request.getTwoFactorCode().isEmpty()) {
                return verifyAndLogin(user, request.getTwoFactorCode(), request.isRememberMe());
            }

            // Generate and send 2FA code
            String code = emailService.generateVerificationCode();
            user.setTwoFactorSecret(code);
            userRepository.save(user);

            emailService.sendVerificationCode(user, code);

            AuthResponseDto response = new AuthResponseDto();
            response.setRequiresTwoFactor(true);
            response.setAuthProvider(AuthProvider.LOCAL);
            response.setUser(createUserProfile(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Login failed: " + e.getMessage()));
        }
    }

    // === VERIFY 2FA CODE ===
    @PostMapping("/verify-2fa")
    public ResponseEntity<AuthResponseDto> verify2FA(@Valid @RequestBody TwoFactorRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not found"));
            }

            return verifyAndLogin(user, request.getCode(), false);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Verification failed: " + e.getMessage()));
        }
    }

    // === OAUTH LOGIN ===
    @PostMapping("/oauth/login")
    public ResponseEntity<OAuthLoginResponseDto> oauthLogin(@Valid @RequestBody OAuthLoginDto request) {
        try {
            return authService.processOAuthLogin(request);
        } catch (Exception e) {
            OAuthLoginResponseDto response = new OAuthLoginResponseDto();
            response.setSuccess(false);
            response.setMessage("OAuth login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // === REFRESH TOKEN ===
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        try {
            return authService.refreshToken(request.getRefreshToken());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Token refresh failed: " + e.getMessage()));
        }
    }

    // === PASSWORD RESET REQUEST ===
    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponseDto> forgotPassword(@Valid @RequestBody PasswordResetRequestDto request) {
        try {
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            BaseResponseDto response = new BaseResponseDto();

            if (user == null) {
                response.setSuccess(true);
                response.setMessage("If the email exists, a reset code has been sent");
                return ResponseEntity.ok(response);
            }

            // Generate a 6-digit code
            String resetCode = String.format("%06d", new Random().nextInt(1000000));
            user.setTwoFactorSecret(resetCode);
            userRepository.save(user);

            emailService.sendPasswordResetEmail(user, resetCode);

            response.setSuccess(true);
            response.setMessage("Password reset code sent to your email");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            BaseResponseDto response = new BaseResponseDto();
            response.setSuccess(false);
            response.setMessage("Failed to process password reset request");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<BaseResponseDto> verifyResetCode(@Valid @RequestBody PasswordResetCodeDto request) {
        try {
            BaseResponseDto response = new BaseResponseDto();

            System.out.println(
                    "Verify Reset Code Request - Email: " + request.getEmail() + ", Code: " + request.getCode());

            // Find user by email (case-insensitive) and the reset code
            Optional<User> userOpt = userRepository.findByEmailIgnoreCaseAndTwoFactorSecret(request.getEmail(),
                    request.getCode());

            if (!userOpt.isPresent()) {
                System.out.println(
                        "Verify Reset Code Failed: Invalid or expired reset code for email " + request.getEmail());
                response.setSuccess(false);
                response.setMessage("Invalid or expired reset code");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            System.out.println("Verify Reset Code Success for email: " + request.getEmail());
            response.setSuccess(true);
            response.setMessage("Code verified successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Exception in verifyResetCode: " + e.getMessage());
            BaseResponseDto response = new BaseResponseDto();
            response.setSuccess(false);
            response.setMessage("Failed to verify reset code");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<BaseResponseDto> resetPassword(@Valid @RequestBody PasswordResetConfirmDto request) {
        try {
            BaseResponseDto response = new BaseResponseDto();

            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                response.setSuccess(false);
                response.setMessage("New password and confirm password do not match.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            User user = userRepository.findByEmailIgnoreCaseAndTwoFactorSecret(request.getEmail(), request.getCode())
                    .orElseThrow(() -> new RuntimeException("Invalid or expired reset code."));

            // Update password
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setTwoFactorSecret(null); // Clear reset code after use
            userRepository.save(user);

            response.setSuccess(true);
            response.setMessage("Password reset successfully.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            BaseResponseDto response = new BaseResponseDto();
            response.setSuccess(false);
            response.setMessage("Failed to reset password: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponseDto> logout() {
        BaseResponseDto response = new BaseResponseDto();
        response.setSuccess(true);
        response.setMessage("Logged out successfully");
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<AuthResponseDto> verifyAndLogin(User user, String code, boolean rememberMe) {
        if (!code.equals(user.getTwoFactorSecret())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) { // Example: Lock after 5 failed attempts
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15)); // Lock for 15 minutes
                user.setFailedLoginAttempts(0); // Reset attempts after locking
            }
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createErrorResponse("Invalid 2FA code"));
        }

        // Clear 2FA secret after successful verification
        user.setTwoFactorSecret(null);
        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(createUserProfile(user));

        return ResponseEntity.ok(response);
    }

    private UserProfileDto createUserProfile(User user) {
        UserProfileDto profile = new UserProfileDto();
        profile.setId(user.getId());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setEmail(user.getEmail());
        profile.setRole(user.getRole().name());
        profile.setOrganizationName(user.getOrganization() != null ? user.getOrganization().getName() : null);
        profile.setProfilePictureUrl(user.getProfilePictureUrl());
        profile.setActive(user.getIsActive());
        return profile;
    }

    private AuthResponseDto createErrorResponse(String message) {
        AuthResponseDto response = new AuthResponseDto();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}