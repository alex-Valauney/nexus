package com.example.orderservice.repository;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.ArrayList;
import java.util.List;

@DataMongoTest
public class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void cleanUp() { orderRepository.deleteAll(); }

    // Test verifying creating an order entity
    @Test
    void shouldSaveOrder() {
        Order order = new Order();
        OrderItem item = new OrderItem("product-123", "product-name", "seller-1", 12.5, 2);
        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);
        order.setUserId("user-123");
        order.setAmount(25.0);

        Order saved = orderRepository.save(order);
        assert saved.getId() != null;
        assert saved.getItems() != null && !saved.getItems().isEmpty();
        assert saved.getItems().get(0).getProductId().equals("product-123");
        assert saved.getItems().get(0).getQuantity() == 2;
        assert saved.getUserId().equals("user-123");
    }

    // Test verifying finding an order entity
    @Test
    void shouldFindOrderById() {
        Order order = new Order();
        OrderItem item = new OrderItem("product-123", "product-name", "seller-1", 12.5, 2);
        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);
        order.setUserId("user-123");
        order.setAmount(25.0);

        Order saved = orderRepository.save(order);
        var found = orderRepository.findById(saved.getId());
        assert found.isPresent();
        assert found.get().getItems() != null && !found.get().getItems().isEmpty();
        assert found.get().getItems().get(0).getProductId().equals("product-123");
    }

    // Test updating an existing order entity
    @Test
    void shouldUpdateOrder() {
        Order order = new Order();
        OrderItem item = new OrderItem("product-123", "product-name", "seller-1", 12.5, 2);
        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);
        order.setUserId("user-123");
        order.setAmount(25.0);

        Order saved = orderRepository.save(order);
        saved.setAmount(30.0);
        Order updated = orderRepository.save(saved);
        assert updated.getAmount() == 30.0;
    }

    // Test to verify deleting order entity
    @Test
    void shouldDeleteOrder() {
        Order order = new Order();
        OrderItem item = new OrderItem("product-123", "product-name", "seller-1", 12.5, 2);
        List<OrderItem> items = new ArrayList<>();
        items.add(item);
        order.setItems(items);
        order.setUserId("user-123");
        order.setAmount(25.0);

        Order saved = orderRepository.save(order);
        orderRepository.deleteById(saved.getId());
        var found = orderRepository.findById(saved.getId());
        assert found.isEmpty();
    }
}