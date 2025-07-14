package Room.ConferenceRoomMgtsys.dto.booking;

import Room.ConferenceRoomMgtsys.enums.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class BookingSearchDto {
    private UUID userId;             
    private UUID roomId;              

    private String userOrganizationName;    
    private String roomOrganizationName;    

    private BookingStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String searchTerm;
    private Boolean isRecurring;
    private String sortBy = "startTime";
    private String sortDirection = "DESC";

    public BookingSearchDto() {}

    // Getters and Setters
    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getRoomId() {
        return roomId;
    }

    public void setRoomId(UUID roomId) {
        this.roomId = roomId;
    }

    public String getUserOrganizationName() {
        return userOrganizationName;
    }

    public void setUserOrganizationName(String userOrganizationName) {
        this.userOrganizationName = userOrganizationName;
    }

    public String getRoomOrganizationName() {
        return roomOrganizationName;
    }

    public void setRoomOrganizationName(String roomOrganizationName) {
        this.roomOrganizationName = roomOrganizationName;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
}