package Room.ConferenceRoomMgtsys.controller;

import Room.ConferenceRoomMgtsys.dto.report.*;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.service.ReportingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = { "http://localhost:5173",  "http://10.8.150.139:8090","https://conferenceroomsystem.vercel.app" })
public class ReportingController {

    @Autowired
    private ReportingService reportingService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<?> generateReport(
            @RequestBody ReportRequestDto request,
            @AuthenticationPrincipal User currentUser) {

        switch (request.getReportType()) {
            case "USER_REPORT":
                UserReportDto userReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    userReport = reportingService.generateSystemUserReport(request);
                } else {
                    userReport = reportingService.generateOrganizationUserReport(request, currentUser);
                }
                return ResponseEntity.ok(userReport);

            case "BOOKING_REPORT":
                BookingReportDto bookingReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    bookingReport = reportingService.generateSystemBookingReport(request);
                } else {
                    bookingReport = reportingService.generateOrganizationBookingReport(request, currentUser);
                }
                return ResponseEntity.ok(bookingReport);

            case "ROOM_USAGE_REPORT":
                RoomUsageReportDto roomUsageReport;
                if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
                    roomUsageReport = reportingService.generateSystemRoomUsageReport(request);
                } else {
                    roomUsageReport = reportingService.generateOrganizationRoomUsageReport(request, currentUser);
                }
                return ResponseEntity.ok(roomUsageReport);

            default:
                return ResponseEntity.badRequest().body("Invalid report type specified.");
        }
    }

    // PDF Generation
    @PostMapping("/pdf")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN')")
    public ResponseEntity<byte[]> generatePdfReport(@RequestBody ReportRequestDto request) {
        User currentUser = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        byte[] pdf = reportingService.generatePdfReport(request, currentUser);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        String filename = "report.pdf";
        headers.setContentDispositionFormData(filename, filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    // Quick report endpoints for common scenarios
    @GetMapping("/system/users/weekly")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserReportDto> getWeeklySystemUserReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.WEEKLY);
        request.setReportType("USER_REPORT");

        UserReportDto report = reportingService.generateSystemUserReport(request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/system/users/monthly")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserReportDto> getMonthlySystemUserReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.MONTHLY);
        request.setReportType("USER_REPORT");

        UserReportDto report = reportingService.generateSystemUserReport(request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/system/bookings/weekly")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<BookingReportDto> getWeeklySystemBookingReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.WEEKLY);
        request.setReportType("BOOKING_REPORT");

        BookingReportDto report = reportingService.generateSystemBookingReport(request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/system/bookings/monthly")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<BookingReportDto> getMonthlySystemBookingReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.MONTHLY);
        request.setReportType("BOOKING_REPORT");

        BookingReportDto report = reportingService.generateSystemBookingReport(request);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/organization/users/weekly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserReportDto> getWeeklyOrganizationUserReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.WEEKLY);
        request.setReportType("USER_REPORT");

        UserReportDto report = reportingService.generateOrganizationUserReport(request, currentUser);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/organization/users/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserReportDto> getMonthlyOrganizationUserReport(@AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.MONTHLY);
        request.setReportType("USER_REPORT");

        UserReportDto report = reportingService.generateOrganizationUserReport(request, currentUser);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/organization/bookings/weekly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingReportDto> getWeeklyOrganizationBookingReport(
            @AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.WEEKLY);
        request.setReportType("BOOKING_REPORT");

        BookingReportDto report = reportingService.generateOrganizationBookingReport(request, currentUser);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/organization/bookings/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingReportDto> getMonthlyOrganizationBookingReport(
            @AuthenticationPrincipal User currentUser) {
        ReportRequestDto request = new ReportRequestDto();
        request.setTimePeriod(ReportTimePeriod.MONTHLY);
        request.setReportType("BOOKING_REPORT");

        BookingReportDto report = reportingService.generateOrganizationBookingReport(request, currentUser);
        return ResponseEntity.ok(report);
    }
}