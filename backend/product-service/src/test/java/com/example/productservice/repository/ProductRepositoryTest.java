package com.example.productservice.repository;

import com.example.productservice.model.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

@DataMongoTest
public class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void cleanUp() {
        productRepository.deleteAll();
    }

    // Test to verify saving a Product entity
    @Test
    void shouldSaveProduct() {
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("This is a test product");
        product.setUserId("user-123");
        Product saved = productRepository.save(product);
        assert saved.getId() != null;
        assert saved.getName().equals("Test Product");
        assert saved.getDescription().equals("This is a test product");
        assert saved.getUserId().equals("user-123");
    }

    // Test to verify finding a Product entity
    @Test
    void shouldFindProductById() {
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("This is a test product");
        product.setUserId("user-123");
        Product saved = productRepository.save(product);
        var found = productRepository.findById(saved.getId());
        assert found.isPresent();
        assert found.get().getName().equals("Test Product");
    }

    // Test to verify updating a Product entity
    @Test
    void shouldUpdateProduct() {
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("This is a test product");
        product.setUserId("user-123");
        Product saved = productRepository.save(product);
        saved.setName("Updated Product");
        Product updated = productRepository.save(saved);
        assert updated.getName().equals("Updated Product");
    }

    // Test to verify deleting a Product entity
    @Test
    void shouldDeleteProduct() {
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("This is a test product");
        product.setUserId("user-123");
        Product saved = productRepository.save(product);
        productRepository.deleteById(saved.getId());
        var found = productRepository.findById(saved.getId());
        assert found.isEmpty();
    }

}