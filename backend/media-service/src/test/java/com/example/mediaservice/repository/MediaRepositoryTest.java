package com.example.mediaservice.repository;

import com.example.mediaservice.model.Media;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// DataMongoTest to create a test environment & interact with a in-memory database
@DataMongoTest
class MediaRepositoryTest {

    @Autowired
    private MediaRepository mediaRepository;

    @BeforeEach
    void cleanUp() {
        mediaRepository.deleteAll();
    }

    // Test to verify saving a Media entity with all fields
    @Test
    void shouldSaveMediaWithAllFields() {
        Media media = new Media("https://example.com/images/product1.jpg", "prod-123");
        Media saved = mediaRepository.save(media);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getImagePath()).isEqualTo("https://example.com/images/product1.jpg");
        assertThat(saved.getProductId()).isEqualTo("prod-123");
    }

    // Test to verify finding Media entities by productId
    @Test
    void shouldFindMediaByProductId() {
        Media media1 = new Media("https://example.com/images/prod123-1.jpg", "prod-123");
        Media media2 = new Media("https://example.com/images/prod123-2.jpg", "prod-123");

        mediaRepository.save(media1);
        mediaRepository.save(media2);

        List<Media> result = mediaRepository.findByProductId("prod-123");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Media::getProductId).containsOnly("prod-123");
    }
}