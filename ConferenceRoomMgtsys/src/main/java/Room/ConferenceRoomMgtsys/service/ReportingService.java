package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.report.*;
import Room.ConferenceRoomMgtsys.model.User;

import java.util.UUID;

public interface ReportingService {

    // System Admin Reports
    UserReportDto generateSystemUserReport(ReportRequestDto request);

    BookingReportDto generateSystemBookingReport(ReportRequestDto request);

    RoomUsageReportDto generateSystemRoomUsageReport(ReportRequestDto request);

    // Organization Admin Reports
    UserReportDto generateOrganizationUserReport(ReportRequestDto request, User admin);

    BookingReportDto generateOrganizationBookingReport(ReportRequestDto request, User admin);

    RoomUsageReportDto generateOrganizationRoomUsageReport(ReportRequestDto request, User admin);

    // PDF Generation
    byte[] generatePdfReport(ReportRequestDto request, User currentUser);

    // Helper methods
    ReportTimePeriod calculateTimePeriod(ReportRequestDto request);

    boolean hasAccessToOrganization(User user, UUID organizationId);
}