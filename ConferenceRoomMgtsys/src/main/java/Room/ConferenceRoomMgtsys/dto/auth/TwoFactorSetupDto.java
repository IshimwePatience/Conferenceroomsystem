package Room.ConferenceRoomMgtsys.dto.auth;

import java.util.List;

public class TwoFactorSetupDto {
    private String twoFactorCode;
    private String secret;
    private String qrCodeUrl;
    private List<String> backupCodes;

    public TwoFactorSetupDto() {}

    public TwoFactorSetupDto(String twoFactorCode, String secret) {
        this.twoFactorCode = twoFactorCode;
        this.secret = secret;
    }

    public TwoFactorSetupDto(String twoFactorCode, String secret, String qrCodeUrl, List<String> backupCodes) {
        this.twoFactorCode = twoFactorCode;
        this.secret = secret;
        this.qrCodeUrl = qrCodeUrl;
        this.backupCodes = backupCodes;
    }

    // Getters and Setters
    public String getTwoFactorCode() {
        return twoFactorCode;
    }

    public void setTwoFactorCode(String twoFactorCode) {
        this.twoFactorCode = twoFactorCode;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public List<String> getBackupCodes() {
        return backupCodes;
    }

    public void setBackupCodes(List<String> backupCodes) {
        this.backupCodes = backupCodes;
    }
}