package Room.ConferenceRoomMgtsys.controller;

import Room.ConferenceRoomMgtsys.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-config")
public class SystemConfigController {
    @Autowired
    private SystemConfigService systemConfigService;

    // Endpoint to get the current status of system admin registration
    @GetMapping("/system-admin-registration-enabled")
    public ResponseEntity<Boolean> isSystemAdminRegistrationEnabled() {
        boolean enabled = systemConfigService.isSystemAdminRegistrationEnabled();
        return ResponseEntity.ok(enabled);
    }

    // Endpoint to set the status (system admin only)
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/system-admin-registration-enabled")
    public ResponseEntity<Void> setSystemAdminRegistrationEnabled(@RequestParam boolean enabled) {
        systemConfigService.setSystemAdminRegistrationEnabled(enabled);
        return ResponseEntity.ok().build();
    }
}