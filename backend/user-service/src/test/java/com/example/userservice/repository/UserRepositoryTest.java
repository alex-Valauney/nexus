package com.example.userservice.repository;

import com.example.userservice.model.User;
import com.example.userservice.model.Role;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.BeforeEach;

@DataMongoTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    // Test to verify saving a User entity
    @Test
    void shouldSaveUser() {
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@mail.com");
        user.setPassword("password123");
        user.setRole(Role.CLIENT);
        User saved = userRepository.save(user);
        assert saved.getId() != null;
        assert saved.getName().equals("Test User");
        assert saved.getEmail().equals("test@mail.com");
        assert saved.getRole() == Role.CLIENT;
    }

    // Test to verify saving a Seller entity
    @Test
    void shouldSaveSeller() {
        User seller = new User();
        seller.setName("Test Seller");
        seller.setEmail("testseller@mail.com");
        seller.setPassword("password123");
        seller.setRole(Role.SELLER);
        User saved = userRepository.save(seller);
        assert saved.getId() != null;
        assert saved.getName().equals("Test Seller");
        assert saved.getEmail().equals("testseller@mail.com");
        assert saved.getRole() == Role.SELLER;
    }

    // Test to verify finding a User entity
    @Test
    void shouldFindUserById() {
        User user = new User();
        user.setName("Test User2");
        user.setEmail("test2@mail.com");
        user.setPassword("password123");
        user.setRole(Role.CLIENT);
        User saved = userRepository.save(user);
        var found = userRepository.findById(saved.getId());
        assert found.isPresent();
        assert found.get().getName().equals("Test User2");
    }

    // Test to verify finding a Seller entity
    @Test
    void shouldFindSellerById() {
        User seller = new User();
        seller.setName("Test Seller2");
        seller.setEmail("testseller2@mail.com");
        seller.setPassword("password123");
        seller.setRole(Role.SELLER);
        User saved = userRepository.save(seller);
        var found = userRepository.findById(saved.getId());
        assert found.isPresent();
        assert found.get().getName().equals("Test Seller2");
    }

    // Test to verify updating a User entity
    @Test
    void shouldUpdateUser() {
        User user = new User();
        user.setName("Test User3");
        user.setEmail("test3@mail.com");
        user.setPassword("password123");
        user.setRole(Role.CLIENT);
        User saved = userRepository.save(user);
        saved.setName("Updated User3");
        User updated = userRepository.save(saved);
        assert updated.getName().equals("Updated User3");
    }

    // Test to verify updating a Seller entity
    @Test
    void shouldUpdateSeller() {
        User seller = new User();
        seller.setName("Test Seller3");
        seller.setEmail("testseller3@mail.com");
        seller.setPassword("password123");
        seller.setRole(Role.SELLER);
        User saved = userRepository.save(seller);
        saved.setName("Updated Seller3");
        User updated = userRepository.save(saved);
        assert updated.getName().equals("Updated Seller3");
    }

    // Test to verify deleting a User entity
    @Test
    void shouldDeleteUser() {
        User user = new User();
        user.setName("Test User4");
        user.setEmail("test4@mail.com");
        user.setPassword("password123");
        user.setRole(Role.CLIENT);
        User saved = userRepository.save(user);
        userRepository.deleteById(saved.getId());
        var found = userRepository.findById(saved.getId());
        assert found.isEmpty();
    }

    // Test to verify deleting a Seller entity
    @Test
    void shouldDeleteSeller() {
        User seller = new User();
        seller.setName("Test Seller4");
        seller.setEmail("testseller4@mail.com");
        seller.setPassword("password123");
        seller.setRole(Role.SELLER);
        User saved = userRepository.save(seller);
        userRepository.deleteById(saved.getId());
        var found = userRepository.findById(saved.getId());
        assert found.isEmpty();
    }

    // Test to verify finding a User by email
    @Test
    void shouldFindUserByEmail() {
        User user = new User();
        user.setName("Test User5");
        user.setEmail("test5@mail.com");
        user.setPassword("password123");
        user.setRole(Role.CLIENT);
        User saved = userRepository.save(user);
        var found = userRepository.findByEmail("test5@mail.com");
        assert found.isPresent();
        assert found.get().getName().equals("Test User5");
    }

    // Test to verify finding a Seller by email
    @Test
    void shouldFindSellerByEmail() {
        User seller = new User();
        seller.setName("Test Seller5");
        seller.setEmail("testseller5@mail.com");
        seller.setPassword("password123");
        seller.setRole(Role.SELLER);
        User saved = userRepository.save(seller);
        var found = userRepository.findByEmail("testseller5@mail.com");
        assert found.isPresent();
        assert found.get().getName().equals("Test Seller5");
    }
}