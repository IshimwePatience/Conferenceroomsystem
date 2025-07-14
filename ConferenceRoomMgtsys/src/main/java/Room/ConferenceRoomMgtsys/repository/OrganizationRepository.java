package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    // Single result queries - Use Optional
    Optional<Organization> findByOrganizationCode(String organizationCode);

    Optional<Organization> findByEmail(String email);

    Optional<Organization> findByPhone(String phone);

    Optional<Organization> findByName(String name);

    // Basic queries with Pagination
    Page<Organization> findByIsActive(Boolean isActive, Pageable pageable);

    Page<Organization> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // List queries for small datasets
    List<Organization> findByIsActive(Boolean isActive);

    // Search queries with Pagination
    @Query("SELECT o FROM Organization o WHERE o.name LIKE %:searchTerm% OR o.description LIKE %:searchTerm% OR o.organizationCode LIKE %:searchTerm%")
    Page<Organization> searchByNameDescriptionOrCode(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Simple list queries
    @Query("SELECT o FROM Organization o WHERE o.isActive = true ORDER BY o.name ASC")
    List<Organization> findAllActiveOrderByName();

    @Query("SELECT o FROM Organization o ORDER BY o.createdAt DESC")
    Page<Organization> findAllOrderByCreatedAtDesc(Pageable pageable);

    // Statistics queries
    @Query("SELECT COUNT(u) FROM User u WHERE u.organization = :organization AND u.isActive = true")
    Long countActiveUsersByOrganization(@Param("organization") Organization organization);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.organization = :organization AND r.isActive = true")
    Long countActiveRoomsByOrganization(@Param("organization") Organization organization);

    // Existence checks
    boolean existsByOrganizationCode(String organizationCode);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByNameIgnoreCase(String name);

    // Projections for performance
    interface OrganizationSummary {
        UUID getId();

        String getName();

        String getOrganizationCode();

        String getEmail();

        Boolean getIsActive();
    }

    interface OrganizationBasicInfo {
        String getName();

        String getOrganizationCode();

        String getEmail();
    }

    List<OrganizationSummary> findOrganizationSummaryByIsActive(Boolean isActive);

    List<OrganizationBasicInfo> findOrganizationBasicInfoByIsActive(Boolean isActive);

    // Method to count active organizations
    long countByIsActive(boolean isActive);
}