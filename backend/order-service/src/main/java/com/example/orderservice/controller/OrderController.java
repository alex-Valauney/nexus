package com.example.orderservice.controller;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
import com.example.orderservice.model.OrderRequest;
import com.example.orderservice.model.OrderStatus;
import com.example.orderservice.repository.OrderRepository;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/order")
public class OrderController {
    private final OrderRepository repo;
    private static final String ERROR_KEY = "error";
    private static final String ORDER_NOT_FOUND_KEY = "order_not_found";
    private static final String SERVER_ERROR_KEY = "Internal server error";

    public OrderController(OrderRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Object> createOrder(@RequestBody OrderRequest order) {
        try {
            // 1. Extraction de la validation (Réduit drastiquement le score)
            Optional<String> validationError = validateOrder(order);
            if (validationError.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, validationError.get()));
            }

            // 2. Extraction du mapping
            Order orderEntity = mapToEntity(order);

            Order savedOrder = repo.save(orderEntity);
            return ResponseEntity.ok(savedOrder);

        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    private Optional<String> validateOrder(OrderRequest order) {
        if (order.getUserId() == null || order.getUserId().isBlank()) {
            return Optional.of("Missing userId");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return Optional.of("Order must contain at least one item");
        }

        for (OrderItem item : order.getItems()) {
            if (item.getProductId() == null || item.getProductId().isBlank()) {
                return Optional.of("Missing productId in items");
            }
            if (item.getQuantity() <= 0) {
                return Optional.of("Item quantity must be greater than 0");
            }
        }
        return Optional.empty();
    }

    private Order mapToEntity(OrderRequest order) {
        Order entity = new Order(order.getUserId(), order.getItems(), order.getAmount());
        if (order.getUserName() != null) entity.setUserName(order.getUserName());
        if (order.getOrderStatus() != null) entity.setOrderStatus(order.getOrderStatus());
        if (order.getPaymentMethod() != null) entity.setPaymentMethod(order.getPaymentMethod());
        if (order.getAdress() != null) entity.setAdress(order.getAdress());
        if (order.getCreatedAt() != null) entity.setCreatedAt(order.getCreatedAt());
        return entity;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOrder(@PathVariable String id) {
        try {
            Optional<Order> order = repo.findById(id);
            if (order.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));
            }
            return ResponseEntity.ok(order.get());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    @GetMapping
    public ResponseEntity<Object> getAllOrders() {
        try {
            List<Order> orders = repo.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateOrder(@PathVariable String id, @RequestBody OrderRequest order) {
        try {
            Optional<Order> existingOpt = repo.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));
            }

            Order existing = existingOpt.get();
            if (order.getUserId() != null) existing.setUserId(order.getUserId());
            if (order.getUserName() != null) existing.setUserName(order.getUserName());
            if (order.getItems() != null) existing.setItems(order.getItems());
            existing.setAmount(order.getAmount());
            if (order.getOrderStatus() != null) existing.setOrderStatus(order.getOrderStatus());
            if (order.getPaymentMethod() != null) existing.setPaymentMethod(order.getPaymentMethod());
            if (order.getAdress() != null) existing.setAdress(order.getAdress());

            Order saved = repo.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    // ANNULER
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Object> cancelOrder(@PathVariable String id) {
        try {
            Optional<Order> orderOpt = repo.findById(id);
            if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));

            Order order = orderOpt.get();
            order.setOrderStatus(OrderStatus.CANCELED);
            return ResponseEntity.ok(repo.save(order));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    // COMPLETE
    @PutMapping("/{id}/complete")
    public ResponseEntity<Object> completeOrder(@PathVariable String id) {
        try {
            Optional<Order> orderOpt = repo.findById(id);
            if (orderOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));

            Order order = orderOpt.get();
            order.setOrderStatus(OrderStatus.COMPLETED);
            return ResponseEntity.ok(repo.save(order));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    // REDO (Refaire une commande identique)
    @PostMapping("/{id}/redo")
    public ResponseEntity<Object> redoOrder(@PathVariable String id) {
        try {
            Optional<Order> originalOpt = repo.findById(id);
            if (originalOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));

            Order original = originalOpt.get();
            // On crée une nouvelle entité basée sur l'ancienne
            Order newOrder = new Order(original.getUserId(), original.getItems(), original.getAmount());
            newOrder.setOrderStatus(OrderStatus.PENDING); // Reset au début
            newOrder.setUserName(original.getUserName());
            newOrder.setPaymentMethod(original.getPaymentMethod());
            newOrder.setAdress(original.getAdress());

            return ResponseEntity.ok(repo.save(newOrder));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteOrder(@PathVariable String id) {
        try {
            if (!repo.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of(ERROR_KEY, ORDER_NOT_FOUND_KEY));
            }
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(ERROR_KEY, SERVER_ERROR_KEY));
        }
    }

}