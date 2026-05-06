package com.example.userservice.controller;

import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private static final String ERROR_KEY = "error";

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String roleStr = body.get("role");
        Role role = "SELLER".equalsIgnoreCase(roleStr) ? Role.SELLER : Role.CLIENT;

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, "Email already in use"));
        }
        String hashed = passwordEncoder.encode(password);
        User u = new User(name, email, hashed, role);
        userRepository.save(u);
        String token = JwtUtil.generateToken(u.getId(), u.getRole().name(), u.getName());
        return ResponseEntity.ok(Map.of("token", token, "userId", u.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        var opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of(ERROR_KEY, "Invalid credentials"));
        User u = opt.get();
        if (!passwordEncoder.matches(password, u.getPassword())) {
            return ResponseEntity.status(401).body(Map.of(ERROR_KEY, "Invalid credentials"));
        }
        String token = JwtUtil.generateToken(u.getId(), u.getRole().name(), u.getName());
        return ResponseEntity.ok(Map.of("token", token, "userId", u.getId()));
    }
}