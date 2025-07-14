package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.AuditLogResponseDto;
import Room.ConferenceRoomMgtsys.model.AuditLog;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.AuditLogRepository;
import Room.ConferenceRoomMgtsys.enums.AuditAction;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;


@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logAction(User user, AuditAction action, String entityType, String entityId, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction(action.name());
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setDetails(details);
        
        return auditLogRepository.save(auditLog);
    }

    @Transactional
    public AuditLog logAction(User user, AuditAction action, String entityType, String entityId, String details, String oldValues, String newValues) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction(action.name());
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setDetails(details);
        auditLog.setOldValues(oldValues);
        auditLog.setNewValues(newValues);
        
        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDto> getUserActivity(User user, Pageable pageable) {
        return auditLogRepository.findByUser(user, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDto> getAuditLogsByAction(AuditAction action, Pageable pageable) {
        return auditLogRepository.findByAction(action.name(), pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponseDto> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findAuditLogsInDateRange(startDate, endDate, pageable)
                .map(this::convertToDto);
    }

    private AuditLogResponseDto convertToDto(AuditLog auditLog) {
        AuditLogResponseDto dto = new AuditLogResponseDto();
        dto.setId(auditLog.getId().toString());
        dto.setAction(auditLog.getAction());
        dto.setEntityType(auditLog.getEntityType());
        dto.setEntityId(auditLog.getEntityId());
        dto.setTimestamp(auditLog.getTimestamp());
        dto.setDetails(auditLog.getDetails());
        dto.setOldValues(auditLog.getOldValues());
        dto.setNewValues(auditLog.getNewValues());
        return dto;
    }
}
