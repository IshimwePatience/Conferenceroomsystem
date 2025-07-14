package Room.ConferenceRoomMgtsys.model;

import java.time.LocalDateTime;
import java.util.UUID;

import Room.ConferenceRoomMgtsys.enums.RoomCommunicationStatus;
import Room.ConferenceRoomMgtsys.model.base.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "room_communications")
public class RoomCommunication extends BaseEntity {
    
    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(name = "is_from_admin")
    private Boolean isFromAdmin = false;
    
    @Column(name = "is_read")
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime readAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoomCommunicationStatus status = RoomCommunicationStatus.PENDING;
    
    @Column(name = "is_extension", nullable = false)
    private Boolean isExtension = false;
    
    @Column(name = "extension_request_time")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime extensionRequestTime;
    
    @Column(name = "extension_end_time")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime extensionEndTime;
    
    @Column(name = "remaining_minutes")
    private Integer remainingMinutes;
    
    @Column(name = "created_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private UUID createdBy;
    
    @Column(name = "updated_by")
    private UUID updatedBy;
    
    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;
    
    @Column(name = "suspension_time")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime suspensionTime;
    
    @Column(name = "is_suspended")
    private Boolean isSuspended = false;

    // Getters and Setters
    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsFromAdmin() {
        return isFromAdmin;
    }

    public void setIsFromAdmin(Boolean isFromAdmin) {
        this.isFromAdmin = isFromAdmin;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public void setCreatedDate(LocalDateTime date) {
        this.createdAt = date;
    }

    public RoomCommunicationStatus getStatus() {
        return status;
    }

    public void setStatus(RoomCommunicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getExtensionRequestTime() {
        return extensionRequestTime;
    }

    public void setExtensionRequestTime(LocalDateTime extensionRequestTime) {
        this.extensionRequestTime = extensionRequestTime;
    }

    public LocalDateTime getExtensionEndTime() {
        return extensionEndTime;
    }

    public void setExtensionEndTime(LocalDateTime extensionEndTime) {
        this.extensionEndTime = extensionEndTime;
    }

    public Integer getRemainingMinutes() {
        return remainingMinutes;
    }

    public void setRemainingMinutes(Integer remainingMinutes) {
        this.remainingMinutes = remainingMinutes;
    }

    public Boolean getIsExtension() {
        return isExtension;
    }

    public void setIsExtension(Boolean isExtension) {
        this.isExtension = isExtension;
    }

    public String getSuspensionReason() {
        return suspensionReason;
    }

    public void setSuspensionReason(String suspensionReason) {
        this.suspensionReason = suspensionReason;
    }
}
