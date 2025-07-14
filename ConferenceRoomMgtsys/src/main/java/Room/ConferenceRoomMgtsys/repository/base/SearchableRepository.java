package Room.ConferenceRoomMgtsys.repository.base;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import java.util.List;

@NoRepositoryBean  // This prevents Spring from creating a bean for this interface
public interface SearchableRepository<T, ID> extends JpaRepository<T, ID> {
    @Query("SELECT e FROM #{#entityName} e WHERE LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<T> search(@Param("query") String query, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT e FROM #{#entityName} e WHERE LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<T> search(@Param("query") String query);
}