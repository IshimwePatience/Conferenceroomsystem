package Room.ConferenceRoomMgtsys.service;

import Room.ConferenceRoomMgtsys.dto.auth.UserRegistrationDto;
import Room.ConferenceRoomMgtsys.dto.auth.SystemAdminRegistrationDto;
import Room.ConferenceRoomMgtsys.dto.admin.AdminCreationDto;
import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.model.Organization;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import Room.ConferenceRoomMgtsys.repository.OrganizationRepository;
import Room.ConferenceRoomMgtsys.enums.UserRole;
import Room.ConferenceRoomMgtsys.enums.ApprovalStatus;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import Room.ConferenceRoomMgtsys.service.SystemConfigService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    @Autowired
    private SystemConfigService systemConfigService;

    public UserService(UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerSystemAdmin(SystemAdminRegistrationDto registrationDto) {
        // Check if system admin already exists
        boolean systemAdminExists = userRepository.existsByRole(UserRole.SYSTEM_ADMIN);
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // If a system admin exists, check if registration is enabled
        if (systemAdminExists && !systemConfigService.isSystemAdminRegistrationEnabled()) {
            throw new RuntimeException(
                    "System admin registration is currently disabled. Please contact an existing system admin.");
        }

        // Validate password confirmation
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Create user
        User user = new User();
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole(UserRole.SYSTEM_ADMIN);
        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setIsApproved(true);
        user.setIsActive(true);
        user.setIsEmailVerified(false);
        user.setIsTwoFactorEnabled(false);
        user.setFailedLoginAttempts(0);
        user.setOrganization(null);

        User savedUser = userRepository.save(user);

        // After registration, auto-disable the flag if not the first system admin
        if (systemAdminExists) {
            systemConfigService.setSystemAdminRegistrationEnabled(false);
        }

        return savedUser;
    }

    @Transactional
    public User registerUser(UserRegistrationDto registrationDto, User currentUser) {
        // Validate password confirmation
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        Organization organization = organizationRepository.findByName(registrationDto.getOrganizationName())
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFirstName(registrationDto.getFirstName());
        user.setLastName(registrationDto.getLastName());
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setOrganization(organization);
        user.setRole(UserRole.USER);
        user.setApprovalStatus(ApprovalStatus.PENDING);
        user.setIsApproved(false);
        user.setIsActive(true);
        user.setIsEmailVerified(false);
        user.setIsTwoFactorEnabled(false);
        user.setFailedLoginAttempts(0);

        User savedUser = userRepository.save(user);

        // Notify org admin and all system admins
        User orgAdmin = userRepository.findByOrganizationAndRole(organization, UserRole.ADMIN).stream().findFirst()
                .orElse(null);
        List<User> systemAdmins = userRepository.findByRole(UserRole.SYSTEM_ADMIN, Pageable.unpaged()).getContent();
        emailService.sendPendingApprovalNotification(savedUser, orgAdmin, systemAdmins);

        // Send welcome email to the user
        emailService.sendWelcomeEmail(savedUser);

        return savedUser;
    }

    @Transactional
    public User createAdmin(AdminCreationDto creationDto, User currentAdmin) {
        // Only SYSTEM_ADMIN can create admins
        if (!currentAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("Only system admin can create organization admins");
        }

        // Find user to promote
        User userToPromote = userRepository.findByEmail(creationDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user is a normal user
        if (userToPromote.getRole() != UserRole.USER) {
            throw new RuntimeException("Can only promote normal users to organization admins");
        }

        // Verify user has an organization
        if (userToPromote.getOrganization() == null) {
            throw new RuntimeException("User must belong to an organization to be promoted to admin");
        }

        // Update user to admin
        userToPromote.setRole(UserRole.ADMIN);
        userToPromote.setApprovalStatus(ApprovalStatus.APPROVED);
        userToPromote.setIsApproved(true);
        userToPromote.setApprovedBy(currentAdmin);
        userToPromote.setApprovedAt(LocalDateTime.now());

        return userRepository.save(userToPromote);
    }

    @Transactional
    public User updateUserActiveStatus(UUID userId, Boolean isActive, User currentAdmin) {
        // Validate current user is admin
        if (!currentAdmin.getRole().equals(UserRole.ADMIN) && !currentAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("Only admins can change user status");
        }

        // Ensure isActive is not null
        if (isActive == null) {
            throw new IllegalArgumentException("Active status (isActive) cannot be null.");
        }

        // Find user to update
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent self-deactivation
        if (userToUpdate.getId().equals(currentAdmin.getId())) {
            throw new RuntimeException("Cannot change your own active status");
        }

        // Check authorization based on role
        if (currentAdmin.getRole().equals(UserRole.ADMIN)) {
            // Organization admin can only manage users within their organization
            if (!userToUpdate.getOrganization().equals(currentAdmin.getOrganization())) {
                throw new RuntimeException("Cannot change status for users from different organization");
            }
            // Organization admin cannot manage other admins
            if (userToUpdate.getRole().equals(UserRole.ADMIN)) {
                throw new RuntimeException("Organization admin cannot manage other admins");
            }
        }
        // System admin can manage any user except themselves

        // Update active status
        userToUpdate.setIsActive(isActive);

        // Set approval status based on active status
        if (isActive) {
            userToUpdate.setApprovalStatus(ApprovalStatus.APPROVED);
            userToUpdate.setIsApproved(true);
            userToUpdate.setApprovedBy(currentAdmin);
            userToUpdate.setApprovedAt(LocalDateTime.now());
            userToUpdate.setRejectedBy(null);
            userToUpdate.setRejectedAt(null);
            userToUpdate.setRejectionReason(null);
        } else {
            userToUpdate.setApprovalStatus(ApprovalStatus.REJECTED);
            userToUpdate.setIsApproved(false);
            userToUpdate.setRejectedBy(currentAdmin);
            userToUpdate.setRejectedAt(LocalDateTime.now());
            userToUpdate.setApprovedBy(null);
            userToUpdate.setApprovedAt(null);
        }

        User savedUser = userRepository.save(userToUpdate);

        // Send email notification based on status change
        try {
            if (isActive) {
                // Do not send approval email here; handled in approveUser
            } else {
                emailService.sendRejectionEmail(savedUser.getEmail(), savedUser.getFirstName());
            }
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }

        return savedUser;
    }

    public List<User> getPendingUsers(User currentAdmin) {
        if (!currentAdmin.getRole().equals(UserRole.ADMIN) && !currentAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("Only admins can view pending users");
        }

        if (currentAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            return userRepository.findByApprovalStatus(ApprovalStatus.PENDING);
        } else {
            return userRepository.findByOrganizationAndApprovalStatus(currentAdmin.getOrganization(),
                    ApprovalStatus.PENDING);
        }
    }

    public Page<User> getAllUsers(String search, String organizationId, String role, Pageable pageable,
            User currentUser) {
        return userRepository.findAll((Specification<User>) (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by current user's organization if not SYSTEM_ADMIN
            if (!currentUser.getRole().equals(UserRole.SYSTEM_ADMIN)) {
                if (currentUser.getOrganization() == null) {
                    throw new RuntimeException("User is not associated with an organization.");
                }
                predicates.add(criteriaBuilder.equal(root.get("organization").get("id"),
                        currentUser.getOrganization().getId()));
            }

            // Search by firstName, lastName, or email
            if (search != null && !search.trim().isEmpty()) {
                String lowerCaseSearch = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), lowerCaseSearch),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), lowerCaseSearch),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), lowerCaseSearch));
                predicates.add(searchPredicate);
            }

            // Filter by organizationId (for SYSTEM_ADMIN or if an admin wants to filter
            // within their org)
            if (organizationId != null && !organizationId.trim().isEmpty()) {
                predicates.add(
                        criteriaBuilder.equal(root.get("organization").get("id"), UUID.fromString(organizationId)));
            }

            // Filter by role
            if (role != null && !role.trim().isEmpty()) {
                try {
                    UserRole userRole = UserRole.valueOf(role.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("role"), userRole));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid user role: " + role);
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Transactional
    public User updateUser(UUID id, User updatedUser, User currentUser) {
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Authorization check
        if (currentUser.getRole() != UserRole.SYSTEM_ADMIN &&
                (currentUser.getRole() != UserRole.ADMIN || !Objects.equals(currentUser.getOrganization().getId(),
                        userToUpdate.getOrganization().getId()))) {
            throw new RuntimeException("Unauthorized to update this user.");
        }

        // Update fields that are allowed to be updated
        userToUpdate.setFirstName(updatedUser.getFirstName());
        userToUpdate.setLastName(updatedUser.getLastName());
        userToUpdate.setEmail(updatedUser.getEmail());
        // Only System Admin can change role and organization
        if (currentUser.getRole() == UserRole.SYSTEM_ADMIN) {
            userToUpdate.setRole(updatedUser.getRole());
            if (updatedUser.getOrganization() != null) {
                Organization newOrg = organizationRepository.findById(updatedUser.getOrganization().getId())
                        .orElseThrow(() -> new RuntimeException("Organization not found."));
                userToUpdate.setOrganization(newOrg);
            }
        }
        // You might want to add more specific logic here for what fields can be updated
        // by whom

        return userRepository.save(userToUpdate);
    }

    @Transactional
    public void deleteUser(UUID id, User currentUser) {
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        // Authorization check
        if (currentUser.getRole() != UserRole.SYSTEM_ADMIN &&
                (currentUser.getRole() != UserRole.ADMIN || !Objects.equals(currentUser.getOrganization().getId(),
                        userToDelete.getOrganization().getId()))) {
            throw new RuntimeException("Unauthorized to delete this user.");
        }

        // Prevent deleting System Admin or self deletion if not System Admin
        if (userToDelete.getRole() == UserRole.SYSTEM_ADMIN && currentUser.getRole() != UserRole.SYSTEM_ADMIN) {
            throw new RuntimeException("Cannot delete a System Admin.");
        }
        if (Objects.equals(userToDelete.getId(), currentUser.getId())
                && currentUser.getRole() != UserRole.SYSTEM_ADMIN) {
            throw new RuntimeException("Users cannot delete themselves unless they are a System Admin.");
        }

        userRepository.delete(userToDelete);
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User approveUser(UUID userId, Boolean approve, UserRole role, User currentAdmin) {
        if (!currentAdmin.getRole().equals(UserRole.ADMIN) && !currentAdmin.getRole().equals(UserRole.SYSTEM_ADMIN)) {
            throw new RuntimeException("Only admins can approve or reject users");
        }

        User userToApprove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Organization admin can only approve users within their organization
        if (currentAdmin.getRole().equals(UserRole.ADMIN)
                && !userToApprove.getOrganization().equals(currentAdmin.getOrganization())) {
            throw new RuntimeException("Cannot approve/reject users from a different organization");
        }

        if (approve) {
            userToApprove.setApprovalStatus(ApprovalStatus.APPROVED);
            userToApprove.setIsApproved(true);
            userToApprove.setApprovedBy(currentAdmin);
            userToApprove.setApprovedAt(LocalDateTime.now());
            userToApprove.setRejectedBy(null);
            userToApprove.setRejectedAt(null);
            userToApprove.setRejectionReason(null);
            // Set the role based on the provided 'role' parameter
            userToApprove.setRole(role);

            try {
                emailService.sendApprovalEmail(
                        userToApprove.getEmail(),
                        userToApprove.getFirstName(),
                        currentAdmin.getFirstName() + " " + currentAdmin.getLastName(),
                        userToApprove.getRole().name());
            } catch (Exception e) {
                System.err.println("Failed to send approval email: " + e.getMessage());
            }
        } else {
            userToApprove.setApprovalStatus(ApprovalStatus.REJECTED);
            userToApprove.setIsApproved(false);
            userToApprove.setRejectedBy(currentAdmin);
            userToApprove.setRejectedAt(LocalDateTime.now());
            userToApprove.setApprovedBy(null);
            userToApprove.setApprovedAt(null);
            userToApprove.setRejectionReason("Rejected by admin"); // Or provide a reason
            try {
                emailService.sendRejectionEmail(userToApprove.getEmail(), userToApprove.getFirstName());
            } catch (Exception e) {
                System.err.println("Failed to send rejection email: " + e.getMessage());
            }
        }

        return userRepository.save(userToApprove);
    }
}
