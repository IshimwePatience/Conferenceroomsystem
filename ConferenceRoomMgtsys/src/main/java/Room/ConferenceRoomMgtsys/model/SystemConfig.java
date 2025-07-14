package Room.ConferenceRoomMgtsys.model;


import jakarta.persistence.*;


@Entity
public class SystemConfig {
    @Id
    private Long id = 1L; // Singleton row

    private boolean systemAdminRegistrationEnabled = false;

    public SystemConfig() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isSystemAdminRegistrationEnabled() {
        return systemAdminRegistrationEnabled;
    }

    public void setSystemAdminRegistrationEnabled(boolean enabled) {
        this.systemAdminRegistrationEnabled = enabled;
    }
}