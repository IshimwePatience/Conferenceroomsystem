package Room.ConferenceRoomMgtsys.dto.admin.view;


public class AdminBookingViewDto {
    private String userName;
    private String userEmail;
    private String userOrganizationName;   
    private String roomName;
    private String roomOrganizationName;    
    private String bookingTime;
    private String duration;
    private String status;
    private String purpose;
    private Integer attendeeCount;
    private String requestedTime;
    private String approvedByName;
    private String approvalTime;
    private String rejectionReason;
    private boolean needsAttention;
    private int unreadMessages;
    
    
    private boolean isCrossOrganizational;  
    private String bookingTypeFlag;         

    public AdminBookingViewDto() {}

    // Getters and Setters
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserOrganizationName() {
        return userOrganizationName;
    }

    public void setUserOrganizationName(String userOrganizationName) {
        this.userOrganizationName = userOrganizationName;
    }

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

    public String getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(String bookingTime) {
        this.bookingTime = bookingTime;
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

    public Integer getAttendeeCount() {
        return attendeeCount;
    }

    public void setAttendeeCount(Integer attendeeCount) {
        this.attendeeCount = attendeeCount;
    }

    public String getRequestedTime() {
        return requestedTime;
    }

    public void setRequestedTime(String requestedTime) {
        this.requestedTime = requestedTime;
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

    public boolean isNeedsAttention() {
        return needsAttention;
    }

    public void setNeedsAttention(boolean needsAttention) {
        this.needsAttention = needsAttention;
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

    public String getBookingTypeFlag() {
        return bookingTypeFlag;
    }

    public void setBookingTypeFlag(String bookingTypeFlag) {
        this.bookingTypeFlag = bookingTypeFlag;
    }
}