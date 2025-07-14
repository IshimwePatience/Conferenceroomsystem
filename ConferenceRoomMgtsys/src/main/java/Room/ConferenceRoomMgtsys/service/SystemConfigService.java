package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.model.SystemConfig;
import Room.ConferenceRoomMgtsys.repository.SystemConfigRepository;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SystemConfigService {
    private static final Long SINGLETON_ID = 1L;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean isSystemAdminRegistrationEnabled() {
        // If no system admin exists yet, registration should be enabled
        if (!userRepository.existsByRole(UserRole.SYSTEM_ADMIN)) {
            return true;
        }
        return getConfig().isSystemAdminRegistrationEnabled();
    }

    @Transactional
    public void setSystemAdminRegistrationEnabled(boolean enabled) {
        SystemConfig config = getConfig();
        config.setSystemAdminRegistrationEnabled(enabled);
        systemConfigRepository.save(config);
    }

    private SystemConfig getConfig() {
        Optional<SystemConfig> configOpt = systemConfigRepository.findById(SINGLETON_ID);
        if (configOpt.isPresent()) {
            return configOpt.get();
        } else {
            SystemConfig config = new SystemConfig();
            config.setId(SINGLETON_ID);
            // If no system admin exists, the initial config should have registration
            // enabled
            config.setSystemAdminRegistrationEnabled(!userRepository.existsByRole(UserRole.SYSTEM_ADMIN));
            return systemConfigRepository.save(config);
        }
    }
}