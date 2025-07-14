package Room.ConferenceRoomMgtsys.dto.user.view;

public class UserBookingViewDto {
    private String roomName;
    private String roomOrganizationName;    // ✅ CLEAR: Which org owns the room
    private String userOrganizationName;    // ✅ ADDED: User's own org for comparison
    private String startTime;
    private String endTime;
    private String duration;
    private String status;
    private String purpose;
    private String notes;
    private Integer attendeeCount;
    private String approvedByName;
    private String approvalTime;
    private String rejectionReason;
    private boolean canCancel;
    private boolean canEdit;
    private int unreadMessages;
    
    
    private boolean isCrossOrganizational;  // true if user.org != room.org
    private String bookingType;             // "Your Organization" or "External Organization"

    public UserBookingViewDto() {}

    // Getters and Setters
    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomOrganizationName() {
        return roomOrganizationName;
    }

    public void setRoomOrganizationName(String roomOrganizationName) {
        this.roomOrganizationName = roomOrganizationName;
    }

    public String getUserOrganizationName() {
        return userOrganizationName;
    }

    public void setUserOrganizationName(String userOrganizationName) {
        this.userOrganizationName = userOrganizationName;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getAttendeeCount() {
        return attendeeCount;
    }

    public void setAttendeeCount(Integer attendeeCount) {
        this.attendeeCount = attendeeCount;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public String getApprovalTime() {
        return approvalTime;
    }

    public void setApprovalTime(String approvalTime) {
        this.approvalTime = approvalTime;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isCanCancel() {
        return canCancel;
    }

    public void setCanCancel(boolean canCancel) {
        this.canCancel = canCancel;
    }

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }

    public int getUnreadMessages() {
        return unreadMessages;
    }

    public void setUnreadMessages(int unreadMessages) {
        this.unreadMessages = unreadMessages;
    }

    public boolean isCrossOrganizational() {
        return isCrossOrganizational;
    }

    public void setCrossOrganizational(boolean crossOrganizational) {
        isCrossOrganizational = crossOrganizational;
    }

    public String getBookingType() {
        return bookingType;
    }

    public void setBookingType(String bookingType) {
        this.bookingType = bookingType;
    }
}

