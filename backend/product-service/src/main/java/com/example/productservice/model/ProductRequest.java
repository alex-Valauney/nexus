package com.example.productservice.model;

import java.util.List;

/**
 * Simple DTO used for creating or updating products via the API.
 * This prevents direct exposure of the persistence entity.
 */
public class ProductRequest {

    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private List<String> imageIds;
    private String category;

    public ProductRequest() {
        // default constructor for deserialization
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public List<String> getImageIds() {
        return imageIds;
    }

    public void setImageIds(List<String> imageIds) {
        this.imageIds = imageIds;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}

