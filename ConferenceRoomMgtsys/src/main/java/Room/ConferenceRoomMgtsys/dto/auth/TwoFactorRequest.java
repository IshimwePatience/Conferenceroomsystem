package Room.ConferenceRoomMgtsys.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class TwoFactorRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Verification code is required")
    @Pattern(regexp = "\\d{6}", message = "Verification code must be 6 digits")
    private String code;

    public TwoFactorRequest() {}

    public TwoFactorRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    // Getters and setters
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public String getCode() { 
        return code; 
    }
    
    public void setCode(String code) { 
        this.code = code; 
    }
}