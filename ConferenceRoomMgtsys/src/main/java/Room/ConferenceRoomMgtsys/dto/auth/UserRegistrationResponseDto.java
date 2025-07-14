package Room.ConferenceRoomMgtsys.dto.auth;

public class UserRegistrationResponseDto {
    private String message;
    private String status;
    private String nextStep;
    private boolean success;
    private String organizationName;  //ADDED: Show which org they registered for

    public UserRegistrationResponseDto() {}

    public UserRegistrationResponseDto(String message, String status, String nextStep, boolean success, String organizationName) {
        this.message = message;
        this.status = status;
        this.nextStep = nextStep;
        this.success = success;
        this.organizationName = organizationName;
    }

    
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNextStep() {
        return nextStep;
    }

    public void setNextStep(String nextStep) {
        this.nextStep = nextStep;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }
}

