package Room.ConferenceRoomMgtsys.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import Room.ConferenceRoomMgtsys.jwt.JwtRequestFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // === PUBLIC ENDPOINTS ===
                        // Authentication & Registration
                        .requestMatchers("/auth/**", "/user/register", "/user/register-system-admin").permitAll()
                        .requestMatchers("/", "/index.html").permitAll()

                        // System admin registration status endpoint (public GET)
                        .requestMatchers(HttpMethod.GET, "/api/system-config/system-admin-registration-enabled")
                        .permitAll()

                        // Serve uploaded files publicly
                        .requestMatchers("/uploads/**").permitAll()

                        // Public room information
                        .requestMatchers("/public/**").permitAll()

                        // Allow public access to organization list for registration
                        .requestMatchers("/organization").permitAll()

                        // API Documentation
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**").permitAll()
                        .requestMatchers("/webjars/**", "/favicon.ico", "/error").permitAll()
                        .requestMatchers("/health", "/actuator/health").permitAll()

                        // === SYSTEM ADMIN ONLY ENDPOINTS ===
                        .requestMatchers("/organization/create").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/api/system/settings/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/api/system/analytics/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/api/system/reports/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/api/users/all/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/dashboard").hasAnyRole("SYSTEM_ADMIN", "ADMIN", "USER")

                        // === ADMIN & SYSTEM_ADMIN ENDPOINTS ===
                        .requestMatchers("/api/users/register").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/user/{userId}/status").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/room/create").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/room/{roomId}").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/room/{roomId}").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/room/access/update").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/rooms/manage/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/booking/organization/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/bookings/manage/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/organizations/settings/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/organizations/reports/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/organizations/analytics/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/user/pending-users").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/user/all").hasAnyRole("ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/room/organization").hasAnyRole("ADMIN", "SYSTEM_ADMIN")

                        // === USER, ADMIN & SYSTEM_ADMIN ENDPOINTS (Rooms & Bookings) ===
                        .requestMatchers(HttpMethod.GET, "/room/search").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/room/{roomId}").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/room/available").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/room/available/capacity")
                        .hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/room/all").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/reports/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")

                        // Existing user endpoints from original SecurityConfig
                        .requestMatchers("/api/bookings/my/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/bookings/create").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/bookings/*/cancel").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/bookings/*/modify").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/profile/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/user/profile/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/notifications/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/calendar/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/schedule/**").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/organizations/my").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/organizations/*/rooms").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/booking").hasAnyRole("USER", "ADMIN", "SYSTEM_ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated());

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Use environment variable for allowed origins in production
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        List<String> allowedOrigins;
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank()) {
            allowedOrigins = Arrays.asList(allowedOriginsEnv.split(","));
        } else {
            // Default to localhost and Vercel for development/production
            allowedOrigins = Arrays.asList(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:3000",
                    "http://localhost:8080",
                    "https://conferenceroomsystem.vercel.app");
        }
        configuration.setAllowedOrigins(allowedOrigins);

        // Allow all headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow specific methods needed for REST API
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow credentials (needed for cookies and authorization headers)
        configuration.setAllowCredentials(true);

        // Expose Authorization header to frontend
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "X-Total-Count"));

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}