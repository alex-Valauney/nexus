package com.example.mediaservice.controller;

import com.example.mediaservice.model.Media;
import com.example.mediaservice.repository.MediaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MediaRepository mediaRepository;

    @BeforeEach
    void setup() throws IOException {
        Path testUploadDir = Paths.get("uploads");
        if (!Files.exists(testUploadDir)) {
            Files.createDirectories(testUploadDir);
        }
    }

    // Test if upload with seller role is successful & if is present in database
    @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldUploadFileWithSellerRole() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        when(mediaRepository.save(any(Media.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(multipart("/api/media/upload")
                        .file(file)
                        .param("productId", "product123")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value("product123"))
                .andExpect(jsonPath("$.imagePath").exists());
    }

    // Test to get media by productId
    @Test
    void shouldGetMediaByProductId() throws Exception {
        Media media = new Media("http://localhost:8083/api/media/file/test.jpg", "product123");
        media.setId("123");
        List<Media> mediaList = Arrays.asList(media);

        when(mediaRepository.findByProductId("product123")).thenReturn(mediaList);

        mockMvc.perform(get("/api/media/product/product123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("123"));
    }
}