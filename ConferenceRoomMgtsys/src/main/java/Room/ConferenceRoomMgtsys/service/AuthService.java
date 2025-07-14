package Room.ConferenceRoomMgtsys.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;

import java.util.List;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import Room.ConferenceRoomMgtsys.jwt.JwtUtil;
import Room.ConferenceRoomMgtsys.dto.auth.*;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.enums.AuthProvider;
import Room.ConferenceRoomMgtsys.enums.UserRole;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Value("${app.oauth.google.client-id:}")
    private String googleClientId;

    @Value("${app.oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.oauth.google.redirect-uri:http://localhost:5173/auth/callback}")
    private String googleRedirectUri;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Google OAuth URLs
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

    // === OAUTH LOGIN PROCESSING ===
    @Transactional
    public ResponseEntity<OAuthLoginResponseDto> processOAuthLogin(OAuthLoginDto request) {
        try {
            OAuthUserInfo oauthUserInfo = null;

            // Process based on provider
            switch (request.getProvider().toUpperCase()) {
                case "GOOGLE":
                    oauthUserInfo = processGoogleLogin(request.getAuthorizationCode());
                    break;
                default:
                    return createOAuthErrorResponse("Unsupported OAuth provider: " + request.getProvider());
            }

            if (oauthUserInfo == null) {
                return createOAuthErrorResponse("Failed to authenticate with OAuth provider");
            }

            // Find or create user
            User user = findOrCreateOAuthUser(oauthUserInfo, request.getProvider());

            // --- TEMPORARY: Log user status for debugging ---
            System.out.println("User status for OAuth login - Email: " + user.getEmail() +
                    ", IsActive: " + user.getIsActive() +
                    ", ApprovalStatus: " + user.getApprovalStatus());
            // --- END TEMPORARY LOGGING ---

            // Check if user is active first (deactivated by admin)
            if (!user.getIsActive()) {
                return createOAuthErrorResponse(
                        "Your account has been deactivated. Please contact your administrator.");
            }

            // Check if account is locked
            if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
                return createOAuthErrorResponse("Account is temporarily locked. Please try again later.");
            }

            // Check if user is approved (pending approval)
            if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                return createOAuthErrorResponse("Your account is pending approval. Please wait for admin approval.");
            }
            // Check if user is rejected
            if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                return createOAuthErrorResponse(
                        "Your account registration has been rejected. Please contact your administrator for more information.");
            }

            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

            // Update last login
            user.setLastLoginAt(LocalDateTime.now());
            user.setFailedLoginAttempts(0); // Reset failed attempts on successful login
            userRepository.save(user);

            // Create response
            OAuthLoginResponseDto response = new OAuthLoginResponseDto();
            response.setSuccess(true);
            response.setMessage("OAuth login successful");
            response.setToken(accessToken);
            response.setRefreshToken(refreshToken);
            response.setUser(createUserProfile(user));
            response.setOrganizationName(user.getOrganization() != null ? user.getOrganization().getName() : null);
            response.setOrganizationRole(user.getRole().toString());
            response.setMultipleOrganizations(false);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("OAuth processing error: " + e.getMessage());
            e.printStackTrace();
            return createOAuthErrorResponse("OAuth login failed: " + e.getMessage());
        }
    }

    // === TOKEN REFRESH ===
    public ResponseEntity<AuthResponseDto> refreshToken(String refreshToken) {
        try {
            if (!jwtUtil.validateRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createAuthErrorResponse("Invalid refresh token"));
            }

            String email = jwtUtil.getEmailFromRefreshToken(refreshToken);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null || !user.getIsApproved() || !user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createAuthErrorResponse("User not found, not approved, or inactive"));
            }

            // Generate new tokens
            String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

            AuthResponseDto response = new AuthResponseDto(
                    newAccessToken,
                    newRefreshToken,
                    86400000L, // 1 day
                    createUserProfile(user),
                    false,
                    AuthProvider.LOCAL);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createAuthErrorResponse("Token refresh failed: " + e.getMessage()));
        }
    }

    // === 2FA SETUP ===
    public ResponseEntity<TwoFactorSetupResponseDto> setup2FA() {
        try {
            // Generate secret for TOTP
            String secret = generateBase32Secret();

            // Generate QR code URL (for Google Authenticator, etc.)
            String qrCodeUrl = generateQRCodeUrl(secret);

            // Generate backup codes
            List<String> backupCodes = generateBackupCodes();

            TwoFactorSetupResponseDto response = new TwoFactorSetupResponseDto(
                    qrCodeUrl,
                    secret,
                    backupCodes);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("2FA setup error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // === GOOGLE OAUTH PROCESSING ===
    private OAuthUserInfo processGoogleLogin(String authorizationCode) {
        try {
            // Step 1: Exchange authorization code for access token
            GoogleTokenResponse tokenResponse = exchangeGoogleCodeForToken(authorizationCode);

            if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
                System.err.println("Failed to get access token from Google");
                return null;
            }

            // Step 2: Get user info from Google
            return getGoogleUserInfo(tokenResponse.getAccessToken());

        } catch (Exception e) {
            System.err.println("Google OAuth error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // === EXCHANGE GOOGLE CODE FOR TOKEN ===
    private GoogleTokenResponse exchangeGoogleCodeForToken(String authorizationCode) {
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            // Prepare request body
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("code", authorizationCode);
            params.add("grant_type", "authorization_code");
            params.add("redirect_uri", googleRedirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            // Make request to Google
            ResponseEntity<GoogleTokenResponse> response = restTemplate.postForEntity(
                    GOOGLE_TOKEN_URL,
                    request,
                    GoogleTokenResponse.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                System.err.println("Google token exchange failed with status: " + response.getStatusCode());
                return null;
            }

        } catch (Exception e) {
            System.err.println("Error exchanging Google code for token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // === GET GOOGLE USER INFO ===
    private OAuthUserInfo getGoogleUserInfo(String accessToken) {
        try {
            // Prepare request headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(headers);

            // Make request to Google UserInfo API
            ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                    GOOGLE_USERINFO_URL,
                    HttpMethod.GET,
                    request,
                    GoogleUserInfo.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                GoogleUserInfo userInfo = response.getBody();

                // Additional null check to prevent potential null pointer access
                if (userInfo != null) {
                    return new OAuthUserInfo(
                            userInfo.getId(),
                            userInfo.getGivenName() != null ? userInfo.getGivenName() : "",
                            userInfo.getFamilyName() != null ? userInfo.getFamilyName() : "",
                            userInfo.getEmail());
                }
            }

            System.err.println("Google userinfo request failed with status: " + response.getStatusCode());
            return null;

        } catch (Exception e) {
            System.err.println("Error getting Google user info: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // === FIND OR CREATE OAUTH USER ===
    @Transactional
    private User findOrCreateOAuthUser(OAuthUserInfo oauthUserInfo, String provider) {
        Optional<User> existingUser = userRepository.findByEmail(oauthUserInfo.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // Update last login for existing user
            user.setLastLoginAt(LocalDateTime.now());
            user.setFailedLoginAttempts(0);

            return userRepository.save(user);
        }

        // Create new user from OAuth info
        User newUser = new User();
        newUser.setFirstName(oauthUserInfo.getFirstName());
        newUser.setLastName(oauthUserInfo.getLastName());
        newUser.setEmail(oauthUserInfo.getEmail());
        newUser.setRole(UserRole.USER);
        newUser.setApprovalStatus(ApprovalStatus.PENDING);
        newUser.setIsApproved(false);
        newUser.setIsActive(true);
        newUser.setIsEmailVerified(true); // OAuth emails are considered verified
        newUser.setEmailVerifiedAt(LocalDateTime.now());
        newUser.setIsTwoFactorEnabled(false);
        newUser.setFailedLoginAttempts(0);

        // No password needed for OAuth users
        newUser.setPasswordHash("");

        User savedUser = userRepository.save(newUser);

        // Send welcome email for new OAuth users
        try {
            emailService.sendWelcomeEmail(savedUser);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        return savedUser;
    }

    // === HELPER METHODS ===
    private String generateBase32Secret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private String generateQRCodeUrl(String secret) {
        String appName = "Conference Room System";
        String userEmail = "user@example.com"; // This should come from current user
        return String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                appName, userEmail, secret, appName);
    }

    private List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        SecureRandom random = new SecureRandom();

        for (int i = 0; i < 10; i++) {
            codes.add(String.format("%08d", random.nextInt(100000000)));
        }

        return codes;
    }

    private UserProfileDto createUserProfile(User user) {
        UserProfileDto profile = new UserProfileDto();
        profile.setId(user.getId());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setEmail(user.getEmail());
        profile.setRole(user.getRole().toString());
        profile.setOrganizationName(user.getOrganization() != null ? user.getOrganization().getName() : null);
        profile.setProfilePictureUrl(user.getProfilePictureUrl());
        profile.setLastLogin(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        profile.setActive(user.getIsActive());
        profile.setEmailVerified(user.getIsEmailVerified());
        profile.setTwoFactorEnabled(user.getIsTwoFactorEnabled());
        return profile;
    }

    private ResponseEntity<OAuthLoginResponseDto> createOAuthErrorResponse(String message) {
        OAuthLoginResponseDto response = new OAuthLoginResponseDto();
        response.setSuccess(false);
        response.setMessage(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    private AuthResponseDto createAuthErrorResponse(String message) {
        AuthResponseDto response = new AuthResponseDto();
        response.setRequiresTwoFactor(false);
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }

    // === GOOGLE API RESPONSE CLASSES ===
    public static class GoogleTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("expires_in")
        private Long expiresIn;

        @JsonProperty("refresh_token")
        private String refreshToken;

        @JsonProperty("scope")
        private String scope;

        @JsonProperty("token_type")
        private String tokenType;

        // Getters and setters
        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public Long getExpiresIn() {
            return expiresIn;
        }

        public void setExpiresIn(Long expiresIn) {
            this.expiresIn = expiresIn;
        }

        public String getRefreshToken() {
            return refreshToken;
        }

        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }

        public String getScope() {
            return scope;
        }

        public void setScope(String scope) {
            this.scope = scope;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }
    }

    public static class GoogleUserInfo {
        @JsonProperty("id")
        private String id;

        @JsonProperty("email")
        private String email;

        @JsonProperty("verified_email")
        private Boolean verifiedEmail;

        @JsonProperty("name")
        private String name;

        @JsonProperty("given_name")
        private String givenName;

        @JsonProperty("family_name")
        private String familyName;

        @JsonProperty("picture")
        private String picture;

        @JsonProperty("locale")
        private String locale;

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Boolean getVerifiedEmail() {
            return verifiedEmail;
        }

        public void setVerifiedEmail(Boolean verifiedEmail) {
            this.verifiedEmail = verifiedEmail;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getGivenName() {
            return givenName;
        }

        public void setGivenName(String givenName) {
            this.givenName = givenName;
        }

        public String getFamilyName() {
            return familyName;
        }

        public void setFamilyName(String familyName) {
            this.familyName = familyName;
        }

        public String getPicture() {
            return picture;
        }

        public void setPicture(String picture) {
            this.picture = picture;
        }

        public String getLocale() {
            return locale;
        }

        public void setLocale(String locale) {
            this.locale = locale;
        }
    }

    // === OAUTH USER INFO CLASS ===
    public static class OAuthUserInfo {
        private String providerId;
        private String firstName;
        private String lastName;
        private String email;

        public OAuthUserInfo(String providerId, String firstName, String lastName, String email) {
            this.providerId = providerId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
        }

        public String getProviderId() {
            return providerId;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getEmail() {
            return email;
        }
    }
}