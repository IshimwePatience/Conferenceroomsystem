package Room.ConferenceRoomMgtsys.dto.report;

import java.time.LocalDate;
import java.util.UUID;

public class ReportRequestDto {
    private ReportTimePeriod timePeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private UUID organizationId; // For organization-specific reports
    private String reportType; // USER_REPORT, BOOKING_REPORT, ROOM_USAGE_REPORT
    private String format; // PDF, EXCEL, JSON

    public ReportRequestDto() {
    }

    public ReportTimePeriod getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(ReportTimePeriod timePeriod) {
        this.timePeriod = timePeriod;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }
}