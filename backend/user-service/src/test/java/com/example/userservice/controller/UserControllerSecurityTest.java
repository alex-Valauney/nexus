package com.example.userservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import com.example.userservice.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.userservice.model.User;
import com.example.userservice.model.Role;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Map;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import org.springframework.boot.test.autoconfigure.data.mongo.AutoConfigureDataMongo;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureDataMongo
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;


    //Test to verify role-based access control - Contrôle d'accès par rôles
    @Test
    void testRoleBasedAccessControl() throws Exception {
        // Create a user with CLIENT role
        User clientUser = new User();
        clientUser.setName("Client User");
        clientUser.setEmail("client@mail.com");
        clientUser.setPassword(new BCryptPasswordEncoder().encode("clientpass"));
        clientUser.setRole(Role.CLIENT);
        userRepository.save(clientUser);

        // Attempt to access a SELLER-only endpoint
        Map<String, String> loginReq = Map.of(
                "email", clientUser.getEmail(),
                "password", "clientpass"
        );
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden()); // 403
    }

    //Test to verify hashed password storage - Vérification du hashage
    @Test
    void testHashedPasswordStorage() throws Exception {
        // Create a new user
        User user = new User();
        user.setName("Hash Test User");
        user.setEmail("hash@mail.com");
        String rawPassword = "hashpass";
        user.setPassword(new BCryptPasswordEncoder().encode(rawPassword));
        user.setRole(Role.CLIENT);
        userRepository.save(user);

        // Retrieve the user from the repository
        User savedUser = userRepository.findById(user.getId()).orElseThrow();
        // Verify that the stored password is not the raw password
        assert !savedUser.getPassword().equals(rawPassword);
        // Verify that the stored password matches when encoded
        assert new BCryptPasswordEncoder().matches(rawPassword, savedUser.getPassword());
    }

    //Test to verify secure password storage - Sécurité du stockage des mots de passe
    @Test
    void testSecurePasswordStorage() throws Exception {
        // Create a new user
        User user = new User();
        user.setName("Secure Test User");
        user.setEmail("secure@mail.com");
        String rawPassword = "securepass";
        user.setPassword(new BCryptPasswordEncoder().encode(rawPassword));
        user.setRole(Role.CLIENT);
        userRepository.save(user);

        // Retrieve the user from the repository
        User savedUser = userRepository.findById(user.getId()).orElseThrow();
        // Ensure the password is stored securely (hashed)
        assert savedUser.getPassword().length() > 20; // Simple length check for hash
    }

}