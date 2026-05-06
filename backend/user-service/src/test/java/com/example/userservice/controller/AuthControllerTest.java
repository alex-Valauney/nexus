// package com.example.userservice.controller;

// import com.example.userservice.repository.UserRepository;
// import com.example.userservice.model.User;
// import com.example.userservice.model.Role;
// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import java.util.Map;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.BeforeEach;
// import jakarta.servlet.http.Cookie;

// @SpringBootTest
// @AutoConfigureMockMvc
// class UserControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @BeforeEach
//     void cleanup() {
//         userRepository.deleteAll();
//     }

//     // Test to verify valid credentials - Validation des identifiants
//     @Test
//     void testValidCredentials() throws Exception {
//         User user = new User();
//         user.setName("Test User");
//         user.setEmail("test@mail.com");
//         user.setPassword(new BCryptPasswordEncoder().encode("password123"));
//         user.setRole(Role.CLIENT);
//         userRepository.save(user);

//         Map<String, String> loginReq = Map.of(
//                 "email", user.getEmail(),
//                 "password", "password123"
//         );

//         mockMvc.perform(post("/api/auth/login")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(loginReq)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.token").exists())
//                 .andExpect(jsonPath("$.userId").value(user.getId()));
//     }

//     // Test to verify invalid credentials - Gestion des identifiants invalides
//     @Test
//     void testInvalidCredentials() throws Exception {
//         Map<String, String> loginReq = Map.of(
//                 "email", "wrong@mail.com",
//                 "password", "wrongpassword"
//         );
//         mockMvc.perform(post("/api/auth/login")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(loginReq)))
//                 .andExpect(status().isUnauthorized())
//                 .andExpect(jsonPath("$.error").value("Invalid credentials"));
//     }

//     // Test to verify missing fields - Validation des données d'entrée
//     @Test
//     void testMissingFields() throws Exception {
//         Map<String, String> loginReq = Map.of(
//                 "email", "",
//                 "password", ""
//         );
//         mockMvc.perform(post("/api/auth/login")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(loginReq)))
//                 .andExpect(status().isUnauthorized())
//                 .andExpect(jsonPath("$.error").value("Invalid credentials"));
//     }

//     // Test to register a new user - Création d'un utilisateur
//     @Test
//     void testRegisterNewUser() throws Exception {
//         Map<String, String> registerReq = Map.of(
//                 "name", "New User",
//                 "email", "newuser@mail.com",
//                 "password", "newpassword",
//                 "role", "CLIENT"
//         );

//         mockMvc.perform(post("/api/auth/register")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(registerReq)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.token").exists())
//                 .andExpect(jsonPath("$.userId").exists());
//     }

//     // Test to register with an existing email - Gestion des doublons
//     @Test
//     void testRegisterExistingEmail() throws Exception {
//         User existingUser = new User();
//         existingUser.setName("Existing User");
//         existingUser.setEmail("existing@mail.com");
//         existingUser.setPassword(new BCryptPasswordEncoder().encode("password123"));
//         existingUser.setRole(Role.CLIENT);
//         userRepository.save(existingUser);
//         Map<String, String> registerReq = Map.of(
//                 "name", "Another User",
//                 "email", "existing@mail.com",
//                 "password", "anotherpassword",
//                 "role", "CLIENT"
//         );

//         mockMvc.perform(post("/api/auth/register")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(registerReq)))
//                 .andExpect(status().isBadRequest())
//                 .andExpect(jsonPath("$.error").value("Email already in use"));
//     }

//     // Test to verify default role assignment on registration - Attribution des rôles
//     @Test
//     void testDefaultRoleAssignment() throws Exception {
//         Map<String, String> registerReq = Map.of(
//                 "name", "Default Role User",
//                 "email", "default@mail.com",
//                 "password", "defaultpassword",
//                 "role", ""
//         );
//         mockMvc.perform(post("/api/auth/register")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(objectMapper.writeValueAsString(registerReq)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.token").exists())
//                 .andExpect(jsonPath("$.userId").exists());
//     }
// }