package Room.ConferenceRoomMgtsys.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> getDashboardData(@AuthenticationPrincipal User currentUser) {
        switch (currentUser.getRole()) {
            case SYSTEM_ADMIN:
                return ResponseEntity.ok(dashboardService.getSystemAdminDashboard());
            case ADMIN:
                return ResponseEntity.ok(dashboardService.getAdminDashboard(currentUser));
            case USER:
                return ResponseEntity.ok(dashboardService.getUserDashboard(currentUser));
            default:
                return ResponseEntity.badRequest().body("Unknown user role");
        }
    }
}
