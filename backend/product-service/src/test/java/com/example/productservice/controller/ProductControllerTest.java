package com.example.productservice.controller;

import com.example.productservice.model.Product;
import com.example.productservice.repository.ProductRepository;
import org.hamcrest.Matchers;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


@SpringBootTest
@AutoConfigureMockMvc
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductRepository productRepository;

    // Test if post product with seller role is successful & if is present in database
    @Test
    @WithMockUser(authorities = "ROLE_SELLER")
    void shouldCreateProductWithSellerRole() throws Exception {
        String productJson = "{ \"name\": \"Test Product\", \"description\": \"A product for testing\", \"price\": 99.99, \"quantity\": 6, \"category\": \"Electronics\" }";

        when(productRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.description").value("A product for testing"))
                .andExpect(jsonPath("$.price").value(99.99))
                .andExpect(jsonPath("$.quantity").value(6))
                .andExpect(jsonPath("$.category").value("Electronics"));
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void shouldRejectCreateWhenNotSeller() throws Exception {
        String productJson = "{ \"name\": \"Test Product\", \"description\": \"A product for testing\", \"price\": 99.99, \"quantity\": 6, \"category\": \"Electronics\" }";

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson)
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only sellers can create products"));
    }

    // Test to get product by id
    @Test
    void shouldGetProductById() throws Exception {
        Product product = new Product();
        product.setId("prod123");
        product.setName("Sample Product");
        product.setDescription("Sample Description");
        product.setPrice(49.99);

        when(productRepository.findById("prod123")).thenReturn(java.util.Optional.of(product));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products/prod123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("prod123"))
                .andExpect(jsonPath("$.name").value("Sample Product"))
                .andExpect(jsonPath("$.description").value("Sample Description"))
                .andExpect(jsonPath("$.price").value(49.99));
    }

    @Test
    void shouldReturnNotFoundWhenProductMissing() throws Exception {
        when(productRepository.findById("missing")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products/missing"))
                .andExpect(status().isNotFound());
    }

    // Test to update product with seller role
    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldUpdateProductWithSellerRole() throws Exception {
        String updatedProductJson = "{ \"name\": \"Updated Product\", \"description\": \"Updated Description\", \"price\": 79.99, \"category\": \"Home\" }";
        Product existingProduct = new Product();
        existingProduct.setId("prod123");
        existingProduct.setUserId("seller1");
        existingProduct.setName("Old Product");
        existingProduct.setDescription("Old Description");
        existingProduct.setPrice(59.99);
        existingProduct.setCategory("Old Category");

        when(productRepository.findById("prod123")).thenReturn(java.util.Optional.of(existingProduct));
        when(productRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/products/prod123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedProductJson)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Product"))
                .andExpect(jsonPath("$.description").value("Updated Description"))
                .andExpect(jsonPath("$.price").value(79.99))
                .andExpect(jsonPath("$.category").value("Home"));
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void shouldRejectUpdateWhenNotSeller() throws Exception {
        String updatedProductJson = "{ \"name\": \"Updated Product\", \"description\": \"Updated Description\", \"price\": 79.99, \"category\": \"Home\" }";

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/products/prod123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedProductJson)
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only sellers can update products"));
    }

    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldReturnNotFoundWhenUpdatingMissingProduct() throws Exception {
        String updatedProductJson = "{ \"name\": \"Updated Product\", \"description\": \"Updated Description\", \"price\": 79.99, \"category\": \"Home\" }";

        when(productRepository.findById("missing")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/products/missing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedProductJson)
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldRejectUpdateWhenNotOwner() throws Exception {
        String updatedProductJson = "{ \"name\": \"Updated Product\", \"description\": \"Updated Description\", \"price\": 79.99, \"category\": \"Home\" }";
        Product existingProduct = new Product();
        existingProduct.setId("prod123");
        existingProduct.setUserId("otherSeller");

        when(productRepository.findById("prod123")).thenReturn(java.util.Optional.of(existingProduct));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/products/prod123")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatedProductJson)
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Cannot modify another seller's product"));
    }

    // Test to delete product with seller role
    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldDeleteProductWithSellerRole() throws Exception {
        Product existingProduct = new Product();
        existingProduct.setId("prod123");
        existingProduct.setUserId("seller1");

        when(productRepository.findById("prod123")).thenReturn(java.util.Optional.of(existingProduct));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/products/prod123")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void shouldRejectDeleteWhenNotSeller() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/products/prod123")
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Only sellers can delete products"));
    }

    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldReturnNotFoundWhenDeletingMissingProduct() throws Exception {
        when(productRepository.findById("missing")).thenReturn(java.util.Optional.empty());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/products/missing")
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "seller1", authorities = "ROLE_SELLER")
    void shouldRejectDeleteWhenNotOwner() throws Exception {
        Product existingProduct = new Product();
        existingProduct.setId("prod123");
        existingProduct.setUserId("otherSeller");

        when(productRepository.findById("prod123")).thenReturn(java.util.Optional.of(existingProduct));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/products/prod123")
                        .with(csrf()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Cannot delete another seller's product"));
    }

    // Test to list all products
    @Test
    void shouldListAllProducts() throws Exception {
        Product product1 = new Product();
        product1.setId("prod1");
        product1.setName("Product 1");
        Product product2 = new Product();
        product2.setId("prod2");
        product2.setName("Product 2");
        java.util.List<Product> productList = java.util.Arrays.asList(product1, product2);

        when(productRepository.findAll()).thenReturn(productList);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("prod1"))
                .andExpect(jsonPath("$[1].id").value("prod2"));
    }

    @Test
    void shouldFilterAndSortProducts() throws Exception {
        Product p1 = new Product();
        p1.setId("p1");
        p1.setName("Product 1");
        p1.setCategory("Electronics");
        p1.setPrice(10.0);

        Product p2 = new Product();
        p2.setId("p2");
        p2.setName("Product 2");
        p2.setCategory("Home");
        p2.setPrice(30.0);

        Product p3 = new Product();
        p3.setId("p3");
        p3.setName("Product 3");
        p3.setCategory("Books");
        p3.setPrice(20.0);

        when(productRepository.findAll()).thenReturn(java.util.Arrays.asList(p1, p2, p3));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products")
                        .param("categories", "Electronics,Home")
                        .param("minPrice", "15")
                        .param("sortBy", "price")
                        .param("sortOrder", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("p2"))
                .andExpect(jsonPath("$", Matchers.hasSize(1)));
    }

    @Test
    void shouldSortByQuantityWithNullsLast() throws Exception {
        Product p1 = new Product();
        p1.setId("p1");
        p1.setQuantity(2);
        Product p2 = new Product();
        p2.setId("p2");
        p2.setQuantity(null);
        Product p3 = new Product();
        p3.setId("p3");
        p3.setQuantity(5);

        when(productRepository.findAll()).thenReturn(java.util.Arrays.asList(p1, p2, p3));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products")
                        .param("sortBy", "quantity")
                        .param("sortOrder", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("p1"))
                .andExpect(jsonPath("$[1].id").value("p3"))
                .andExpect(jsonPath("$[2].id").value("p2"));
    }

    @Test
    void shouldListDistinctSortedCategories() throws Exception {
        Product p1 = new Product();
        p1.setCategory("Home");
        Product p2 = new Product();
        p2.setCategory("Electronics");
        Product p3 = new Product();
        p3.setCategory("Electronics");
        Product p4 = new Product();
        p4.setCategory(" ");
        Product p5 = new Product();
        p5.setCategory(null);

        when(productRepository.findAll()).thenReturn(java.util.Arrays.asList(p1, p2, p3, p4, p5));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/products/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Electronics"))
                .andExpect(jsonPath("$[1]").value("Home"))
                .andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)));
    }

}