package Room.ConferenceRoomMgtsys.repository;

import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.base.SearchableRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends SearchableRepository<User, UUID>, JpaSpecificationExecutor<User> {

    // Single result queries
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndIsActive(String email, Boolean isActive);

    // Basic queries with Pagination
    Page<User> findByOrganization(Organization organization, Pageable pageable);

    Page<User> findByRole(UserRole role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findByEmailContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    Page<User> findByLastLoginAtBefore(LocalDateTime dateTime, Pageable pageable);

    Page<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:name% OR u.lastName LIKE %:name%")
    Page<User> findByNameContaining(@Param("name") String name, Pageable pageable);

    // List queries
    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);

    List<User> findByOrganizationAndApprovalStatus(Organization organization, ApprovalStatus approvalStatus);

    List<User> findByAccountLockedUntilAfter(LocalDateTime dateTime);

    List<User> findByFailedLoginAttemptsGreaterThan(Integer attempts);

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> findByEmailContainingIgnoreCase(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.organization = :organization AND u.isActive = true AND u.approvalStatus = 'APPROVED'")
    List<User> findActiveApprovedUsersByOrganization(@Param("organization") Organization organization);

    @Query("SELECT u FROM User u WHERE u.approvalStatus = 'PENDING' ORDER BY u.createdAt ASC")
    List<User> findPendingUsersOrderByCreatedAt();

    // Statistics queries for Dashboard
    long countByIsActive(boolean isActive); // Counts total active users

    @Query("SELECT new map(o.name as name, COUNT(u.id) as count) FROM User u JOIN u.organization o WHERE o.isActive = true GROUP BY o.name")
    List<Map<String, Object>> countUsersByActiveOrganization(); // Counts users per active organization for chart

    @Query("SELECT COUNT(u) FROM User u WHERE u.organization = :organization AND u.isActive = true")
    Long countActiveUsersByOrganization(@Param("organization") Organization organization); // Counts active users for a
                                                                                           // specific organization

    @Query("SELECT COUNT(u) FROM User u WHERE u.organization = :organization AND u.approvalStatus = 'PENDING'")
    Long countPendingUsersByOrganization(@Param("organization") Organization organization); // Counts pending users for
                                                                                            // a specific organization

    // Existence checks
    boolean existsByEmail(String email);

    boolean existsByOrganizationAndEmail(Organization organization, String email);

    boolean existsByRole(UserRole role);

    // Projections for performance
    interface UserSummary {
        UUID getId();

        String getFirstName();

        String getLastName();

        String getEmail();

        UserRole getRole();

        Boolean getIsActive();
    }

    interface UserBasicInfo {
        String getFirstName();

        String getLastName();

        String getEmail();
    }

    List<UserSummary> findUserSummaryByOrganization(Organization organization);

    List<UserBasicInfo> findUserBasicInfoByOrganizationAndIsActive(Organization organization, Boolean isActive);

    Optional<User> findByTwoFactorSecret(String twoFactorSecret);

    Optional<User> findByEmailAndTwoFactorSecret(String email, String twoFactorSecret);

    Optional<User> findByEmailIgnoreCaseAndTwoFactorSecret(String email, String twoFactorSecret);

    // Reporting methods
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") UserRole role);

    @Query("SELECT u FROM User u WHERE u.isActive = :isActive")
    List<User> findByIsActive(@Param("isActive") Boolean isActive);

    @Query("SELECT u FROM User u WHERE u.organization = :organization AND u.isActive = :isActive")
    List<User> findByOrganizationAndIsActive(@Param("organization") Organization organization,
            @Param("isActive") Boolean isActive);

    @Query("SELECT COUNT(u) FROM User u WHERE u.organization = :organization AND u.role = :role")
    Long countByOrganizationAndRole(@Param("organization") Organization organization, @Param("role") UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.organization = :organization")
    Long countByOrganization(@Param("organization") Organization organization);

    List<User> findByOrganizationAndRole(Organization organization, UserRole role);
}