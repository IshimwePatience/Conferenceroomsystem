package Room.ConferenceRoomMgtsys.jwt;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import Room.ConferenceRoomMgtsys.model.User;
import Room.ConferenceRoomMgtsys.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");
        String email = null;
        String jwtToken = null;
        String role = null;

        // JWT Token is in the form "Bearer token". Remove Bearer word and get only the
        // Token
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(jwtToken);
                role = jwtUtil.getRoleFromToken(jwtToken);
            } catch (Exception e) {
                logger.warn("Unable to get JWT Token or token has expired: " + e.getMessage());
            }
        }

        // Once we get the token validate it
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Load user from database
                User user = userRepository.findByEmail(email).orElse(null);

                if (user != null && jwtUtil.validateToken(jwtToken, email)) {
                    if (role == null || !role.equals(user.getRole().toString())) {
                        logger.warn("Role in JWT token does not match user's role in database for user: " + email);
                    }

                    // Check if user is active
                    if (user.getIsActive()) {
                        // Check if account is not locked
                        if (user.getAccountLockedUntil() == null ||
                                user.getAccountLockedUntil().isBefore(LocalDateTime.now())) {

                            // Create UserDetails object with role from token
                            UserDetails userDetails = org.springframework.security.core.userdetails.User
                                    .withUsername(user.getEmail())
                                    .password(user.getPasswordHash() != null ? user.getPasswordHash() : "")
                                    .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)))
                                    .accountExpired(false)
                                    .accountLocked(false)
                                    .credentialsExpired(false)
                                    .disabled(!user.getIsActive())
                                    .build();

                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    user, null, userDetails.getAuthorities());
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                            // Set authentication in security context
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("Error during JWT authentication: " + e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // Skip JWT validation for public endpoints
        return path.startsWith("/auth/") ||
                path.startsWith("/public/") ||
                path.startsWith("/swagger-ui/") ||
                path.startsWith("/v3/api-docs/") ||
                path.equals("/favicon.ico") ||
                path.equals("/error") ||
                path.equals("/");
    }
}