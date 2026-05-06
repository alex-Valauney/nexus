package com.example.orderservice.model;

public class OrderItem {
    private String productId;
    private String productName;
    private String sellerId;
    private double price;
    private int quantity;

    public OrderItem() {}

    public OrderItem(String productId, String productName, String sellerId, double price, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.sellerId = sellerId;
        this.price = price;
        this.quantity = quantity;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}