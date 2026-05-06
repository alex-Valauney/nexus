package com.example.orderservice.controller;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
import com.example.orderservice.model.OrderStatus;
import com.example.orderservice.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(roles = "CLIENT")
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderRepository orderRepository;

    // TESTS : POST /api/order
    @Test
    void shouldCreateOrder() throws Exception {
        String orderJson = "{ \"userId\": \"user-123\", \"items\": [{ \"productId\": \"prod-123\", \"productName\": \"Test Product\", \"sellerId\": \"seller-1\", \"price\": 12.5, \"quantity\": 2 }], \"amount\": 25.0 }";

        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/order").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-123"))
                .andExpect(jsonPath("$.items[0].productId").value("prod-123"))
                .andExpect(jsonPath("$.amount").value(25.0));
    }

    @Test
    void createOrderWithMissingUserId() throws Exception {
        String invalidOrderJson = "{ \"userId\": \"\", \"items\": [{ \"productId\": \"p1\", \"quantity\": 1 }], \"amount\": 10.0 }";

        mockMvc.perform(post("/api/order").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidOrderJson))
                .andExpect(status().isBadRequest()) // On attend un 400
                .andExpect(jsonPath("$.error").value("Missing userId"));
    }

    @Test
    void createOrderWithMissingItems() throws Exception {
        String invalidOrderJson = "{ \"userId\": \"user-123\", \"items\": [], \"amount\": 0.0 }";

        mockMvc.perform(post("/api/order").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidOrderJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Order must contain at least one item"));
    }

    @Test
    void createOrderWithInvalidQuantity() throws Exception {
        String invalidOrderJson = "{ \"userId\": \"user-123\", \"items\": [], \"amount\": 0.0, \"quandtity\": 0 }";

        mockMvc.perform(post("/api/order").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidOrderJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Order must contain at least one item"));
    }

    @Test
    void createOrderRepositoryException() throws Exception {
        String orderJson = "{ \"userId\": \"user-123\", \"items\": [{ \"productId\": \"p1\", \"quantity\": 1 }], \"amount\": 10.0 }";

        when(orderRepository.save(any())).thenThrow(new RuntimeException("Database connection failed"));

        mockMvc.perform(post("/api/order").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Internal server error"));
    }

    // TEST : GET /api/order/{id}
    @Test
    void shouldFindOrder() throws Exception {
        Order mockOrder = new Order("user-123", null, 50.0);
        mockOrder.setId("666");

        when(orderRepository.findById("666")).thenReturn(java.util.Optional.of(mockOrder));

        mockMvc.perform(get("/api/order/666"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("666"))
                .andExpect(jsonPath("$.userId").value("user-123"));
    }

    @Test
    void getOrderNotFound()  throws Exception {
        when(orderRepository.findById("999")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(get("/api/order/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("order_not_found"));
    }

    // TEST : GET /api/order/
    @Test
    void shouldGetAllOrders() throws Exception {
        Order o1 = new Order("u1", null, 10.0);
        Order o2 = new Order("u2", null, 20.0);

        when(orderRepository.findAll()).thenReturn(java.util.List.of(o1, o2));

        mockMvc.perform(get("/api/order"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getAllOrdersNotFound()  throws Exception {
        when(orderRepository.findAll()).thenReturn(java.util.List.of());

        mockMvc.perform(get("/api/order"))
                .andExpect(status().isOk()) // Renvoyer 200 avec [] est la norme
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAllOrdersRepositoryException()  throws Exception {
        when(orderRepository.findAll()).thenThrow(new RuntimeException("Connection timeout"));

        mockMvc.perform(get("/api/order"))
                .andExpect(status().isInternalServerError()) // Code 500
                .andExpect(jsonPath("$.error").value("Internal server error"));
    }

    // TEST : PUT /api/order/{id}
    @Test
    void updateOrder() throws Exception {
        String updateJson = "{ \"userId\": \"user-updated\", \"amount\": 99.0 }";
        Order existingOrder = new Order("user-old", null, 10.0);
        existingOrder.setId("123");

        when(orderRepository.findById("123")).thenReturn(java.util.Optional.of(existingOrder));
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(put("/api/order/123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-updated"))
                .andExpect(jsonPath("$.amount").value(99.0));
    }

    @Test
    void updateOrderNotFound()  throws Exception {
        String updateJson = "{ \"userId\": \"user-updated\", \"amount\": 99.0 }";

        when(orderRepository.findById("404")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(put("/api/order/404")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("order_not_found"));
    }

    // TEST : DELETE /api/order/{id}
    @Test
    void deleteOrder() throws Exception {
        when(orderRepository.existsById("123")).thenReturn(true);

        mockMvc.perform(delete("/api/order/123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(true));
    }

    @Test
    void deleteOrderNotFound()  throws Exception {
        when(orderRepository.existsById("404")).thenReturn(false);

        mockMvc.perform(delete("/api/order/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("order_not_found"));
    }

    @Test
    void deleteOrderRepositoryException()  throws Exception {
        when(orderRepository.existsById(any())).thenThrow(new RuntimeException("DB Crash"));

        mockMvc.perform(delete("/api/order/123"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("Internal server error"));
    }

    // TEST SHOULD CANCEL ORDER
    @Test
    @WithMockUser
    void shouldCancelOrder() throws Exception {
        Order order = new Order("user-1", List.of(), 10.0);
        order.setId("ord-123");
        order.setOrderStatus(OrderStatus.PENDING);

        when(orderRepository.findById("ord-123")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(put("/api/order/ord-123/cancel")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("CANCELED"));
    }

    // TEST SHOULD REDO ORDER
    @Test
    @WithMockUser
    void shouldRedoOrder() throws Exception {
        OrderItem item = new OrderItem("p-1", "Product", "s-1", 10.0, 1);
        Order original = new Order("user-1", List.of(item), 10.0);
        original.setId("old-id");
        original.setOrderStatus(OrderStatus.COMPLETED);

        when(orderRepository.findById("old-id")).thenReturn(Optional.of(original));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        mockMvc.perform(post("/api/order/old-id/redo")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("PENDING"))
                .andExpect(jsonPath("$.userId").value("user-1"));
    }
}