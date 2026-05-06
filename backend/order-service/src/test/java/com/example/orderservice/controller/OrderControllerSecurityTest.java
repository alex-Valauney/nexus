package com.example.orderservice.controller;

import com.example.orderservice.model.Order;
import com.example.orderservice.model.OrderItem;
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
import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerSecurityTest {
    // MockMvc to simulate HTTP requests
    @Autowired
    private MockMvc mockMvc;

    // to ensure there is no interaction with the real database
    @MockBean
    private OrderRepository orderRepository;

    // TEST : GET /api/order/{id}
    @Test
    void getOrderWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/order/order123"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void getOrderWithAuthenticatedUser() throws Exception {
        Order order = new Order();
        order.setId("order123");
        order.setUserId("user-123");
        OrderItem item = new OrderItem("product-123", "Test Product", "seller-1", 12.5, 2);
        order.setItems(List.of(item));
        order.setAmount(25.0);

        when(orderRepository.findById("order123")).thenReturn(java.util.Optional.of(order));

        mockMvc.perform(get("/api/order/order123").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("order123"))
                .andExpect(jsonPath("$.userId").value("user-123"))
                .andExpect(jsonPath("$.items[0].productId").value("product-123"))
                .andExpect(jsonPath("$.amount").value(25.0));
    }

    // TEST : POST /api/order
    @Test
    void postOrderWithoutValidToken() throws Exception {
            String orderJson = "{ \"userId\": \"user-123\", \"items\": [{ \"productId\": \"prod-123\", \"productName\": \"Test Product\", \"sellerId\": \"seller-1\", \"price\": 12.5, \"quantity\": 2 }], \"amount\": 25.0 }";

            mockMvc.perform(post("/api/order").with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(orderJson))
                    .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void postOrderWithValidToken() throws Exception {
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

    // GET : User ne peut get les commandes que si login
    @Test
    void getOrderWithoutValidToken() throws Exception {
        mockMvc.perform(get("/api/order"))
                .andExpect(status().isForbidden());
    }
}