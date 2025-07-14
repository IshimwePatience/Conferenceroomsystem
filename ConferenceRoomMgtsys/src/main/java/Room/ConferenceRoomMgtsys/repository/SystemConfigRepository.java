package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {
}