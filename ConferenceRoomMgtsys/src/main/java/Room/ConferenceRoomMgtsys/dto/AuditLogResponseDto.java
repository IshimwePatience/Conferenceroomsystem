package Room.ConferenceRoomMgtsys.dto;

import Room.ConferenceRoomMgtsys.enums.AuditAction;
import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogResponseDto {
    private String id;

    public AuditLogResponseDto() {}
    
    public AuditLogResponseDto(String id) {
        this.id = id;
    }
    private AuditAction action;
    private String entityType;
    private String entityId;
    private LocalDateTime timestamp;
    private String details;
    private String oldValues;
    private String newValues;

    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
    public void setId(UUID id) {
        this.id = id.toString();
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }
    
    public void setAction(String action) {
        this.action = AuditAction.valueOf(action);
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getOldValues() {
        return oldValues;
    }

    public void setOldValues(String oldValues) {
        this.oldValues = oldValues;
    }

    public String getNewValues() {
        return newValues;
    }

    public void setNewValues(String newValues) {
        this.newValues = newValues;
    }
}
