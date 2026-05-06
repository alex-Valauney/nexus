package com.example.mediaservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthFilter jwtAuthFilter = new JwtAuthFilter();
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF protection is disabled because this is a stateless REST API using JWT tokens.
                // CSRF attacks target cookie-based session authentication, which is not used here.
                // Authentication is handled via JWT tokens in the Authorization header, making CSRF protection unnecessary.
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/media/product/**").permitAll()
                        .requestMatchers("/api/media/file/**").permitAll()
                        .anyRequest().authenticated()
                )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // In production, restrict allowed origins. For local development allow localhost origins (with ports).
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:4200",
            "http://127.0.0.1:4200",
            "https://localhost:4200",
            "https://127.0.0.1:4200",
            "http://localhost",
            "http://127.0.0.1",
            "https://localhost",
            "https://127.0.0.1"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // Allow credentials in development so Authorization header and cookies can be sent.
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
