package Room.ConferenceRoomMgtsys.dto.auth;

import java.util.List;

public class TwoFactorSetupResponseDto {
    private String qrCodeUrl;
    private String secret;
    private List<String> backupCodes;

    public TwoFactorSetupResponseDto() {}

    public TwoFactorSetupResponseDto(String qrCodeUrl, String secret, List<String> backupCodes) {
        this.qrCodeUrl = qrCodeUrl;
        this.secret = secret;
        this.backupCodes = backupCodes;
    }

    // Getters and Setters
    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public List<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(List<String> backupCodes) {
        this.backupCodes = backupCodes;
    }
}

