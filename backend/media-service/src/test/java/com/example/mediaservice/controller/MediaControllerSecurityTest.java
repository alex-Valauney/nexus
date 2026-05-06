package com.example.mediaservice.controller;

import com.example.mediaservice.model.Media;
import com.example.mediaservice.repository.MediaRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


@WebMvcTest(MediaController.class)
class MediaControllerSecurityTest {

    // MockMvc to simulate HTTP requests
    @Autowired
    private MockMvc mockMvc;

    // to ensure there is no interaction with the real database
    @MockBean
    private MediaRepository mediaRepository;

    // Public access tests
    @Test
    @WithAnonymousUser
    void shouldAllowPublicAccessToGetMediaByProduct() throws Exception {
        // Should return unauthorized for anonymous users to get media by product
        mockMvc.perform(get("/api/media/product/product123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithAnonymousUser
    void shouldAllowPublicAccessToGetFile() throws Exception {
        // Should return unauthorized for anonymous users to get file
        mockMvc.perform(get("/api/media/file/test.jpg"))
                .andExpect(status().isUnauthorized());
    }

    // Tests upload authorization
    @Test
    @WithAnonymousUser
    void shouldBlockAnonymousUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void shouldBlockUserRoleFromUploading() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123")
                        .with(csrf()))
                .andExpect(status().isForbidden()); // Is forbidden for ROLE_USER
    }

    @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldAllowSellerRoleToUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        when(mediaRepository.save(any(Media.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123")
                        .with(csrf()))
                .andExpect(status().isOk()); // Is allowed for ROLE_SELLER
    }

    /////////////////////////////////////////////////////////////
    /////////////////// FAILED TEST FOR AUDIT ///////////////////
    /////////////////////////////////////////////////////////////
    /* @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldAllowSellerRoleToUploadButFail() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123")
                        .with(csrf()))
                .andExpect(status().isForbidden()); // Is allowed for ROLE_SELLER
    } */

    // Test CSRF
    @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldRequireCsrfForUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "content".getBytes());

        // no CSRF token - should return 401
        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123"))
                .andExpect(status().isForbidden());
    }
}