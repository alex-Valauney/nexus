package com.example.productservice.repository;

import com.example.productservice.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByUserId(String userId);
    List<Product> findByCategory(String category);
    List<Product> findByCategoryIn(List<String> categories);
    
    @Aggregation(pipeline = "{ $group: { _id: '$category' } }, { $project: { _id: 0, category: '$_id' } }")
    List<String> findDistinctCategories();
}