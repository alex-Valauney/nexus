package com.example.productservice.controller;

import com.example.productservice.repository.ProductRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class SecurityComponentsTest {

    // MockMvc to simulate HTTP requests
    @Autowired
    private MockMvc mockMvc;

    // to ensure there is no interaction with the real database
    @MockBean
    private ProductRepository ProductRepository;

    // Public access tests
    @Test
    @WithAnonymousUser
    void shouldAllowPublicAccessToGetProduct() throws Exception {
        // Should return unauthorized for anonymous users to get media by product
        mockMvc.perform(get("/api/product/product123"))
                .andExpect(status().isUnauthorized());
    }

    // Tests upload authorization
@Test
        @WithAnonymousUser
        void shouldBlockAnonymousPost() throws Exception {
            mockMvc.perform(post("/api/products")
                            .contentType("application/json")
                            .content("{\"name\":\"Test Product\",\"description\":\"A product for testing\",\"price\":10.0,\"category\":\"Test\"}")
                            .with(csrf()))
                    .andExpect(status().isUnauthorized());
        }

    // Test upload with role USER
@Test
        @WithMockUser(authorities = "ROLE_USER")
        void shouldBlockUserRoleFromPost() throws Exception {
            mockMvc.perform(post("/api/products")
                            .contentType("application/json")
                            .content("{\"name\":\"Test Product\",\"description\":\"A product for testing\",\"price\":10.0,\"category\":\"Test\"}")
                            .with(csrf()))
                    .andExpect(status().isForbidden()); // Is forbidden for ROLE_USER
        }

    // Test upload with role SELLER
@Test
        @WithMockUser(authorities = "ROLE_SELLER")
        void shouldAllowSellerRoleToPost() throws Exception {
            mockMvc.perform(post("/api/products")
                            .contentType("application/json")
                            .content("{\"name\":\"Test Product\",\"description\":\"A product for testing\",\"price\":10.0,\"category\":\"Test\"}")
                            .with(csrf()))
                    .andExpect(status().isOk());
        }

    // Test CSRF
    @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldBlockPostWithoutCsrf() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType("application/json")
                        .content("{\"name\":\"Test Product\",\"description\":\"A product for testing\",\"price\":10.0}"))
                .andExpect(status().isForbidden()); // CSRF token is missing
    }
}