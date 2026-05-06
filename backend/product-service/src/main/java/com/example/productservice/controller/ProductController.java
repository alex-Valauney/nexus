package com.example.productservice.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.productservice.model.Product;
import com.example.productservice.model.ProductRequest;
import com.example.productservice.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductRepository repo;
    private static final String ERROR_KEY = "error";
    private static final String SELLER_KEY = "ROLE_SELLER";

    public ProductController(ProductRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Product> listAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String categories,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        List<Product> products = filterByCategory(repo.findAll(), category, categories);
        products = filterByPrice(products, minPrice, maxPrice);

        Comparator<Product> comparator = (p1, p2) -> compareProducts(p1, p2, sortBy);
        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }
        return products.stream().sorted(comparator).toList();
    }

    private List<Product> filterByCategory(List<Product> products, String category, String categories) {
        if (categories != null && !categories.trim().isEmpty()) {
            List<String> cats = Arrays.stream(categories.split(","))
                .filter(c -> c != null && !c.trim().isEmpty())
                .toList();
            if (!cats.isEmpty()) {
                return products.stream().filter(p -> cats.contains(p.getCategory())).toList();
            }
        } else if (category != null && !category.trim().isEmpty()) {
            return products.stream().filter(p -> category.equals(p.getCategory())).toList();
        }
        return products;
    }

    private List<Product> filterByPrice(List<Product> products, Double minPrice, Double maxPrice) {
        if (minPrice == null && maxPrice == null) {
            return products;
        }
        return products.stream()
            .filter(p -> {
                Double price = p.getPrice();
                return price != null
                    && (minPrice == null || price >= minPrice)
                    && (maxPrice == null || price <= maxPrice);
            })
            .toList();
    }

    private int compareProducts(Product p1, Product p2, String sortBy) {
        switch (sortBy.toLowerCase()) {
            case "price":
                return compareNullable(p1.getPrice(), p2.getPrice(), Double::compare);
            case "quantity":
                return compareNullable(p1.getQuantity(), p2.getQuantity(), Integer::compare);
            case "category":
                return orEmpty(p1.getCategory()).compareToIgnoreCase(orEmpty(p2.getCategory()));
            default: // "name" and fallback
                return orEmpty(p1.getName()).compareToIgnoreCase(orEmpty(p2.getName()));
        }
    }

    private <T> int compareNullable(T a, T b, java.util.function.ToIntBiFunction<T, T> cmp) {
        if (a == null && b == null) return 0;
        if (a == null) return 1;  // nulls at end
        if (b == null) return -1;
        return cmp.applyAsInt(a, b);
    }

    private String orEmpty(String s) {
        return s != null ? s : "";
    }

    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return repo.findAll().stream()
            .map(Product::getCategory)
            .filter(c -> c != null && !c.trim().isEmpty())
            .distinct()
            .sorted()
            .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getOne(@PathVariable String id) {
        return repo.findById(id).map(p -> ResponseEntity.ok((Object)p)).orElse(ResponseEntity.notFound().build());
    }

    // create product - only seller
    @PostMapping
    public ResponseEntity<Object> create(@RequestBody ProductRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equalsIgnoreCase(SELLER_KEY))) {
            return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Only sellers can create products"));
        }
        String userId = auth.getName();
        Product p = new Product();
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        p.setPrice(request.getPrice());
        p.setQuantity(request.getQuantity());
        p.setImageIds(request.getImageIds());
        p.setCategory(request.getCategory());
        p.setUserId(userId);
        Product saved = repo.save(p);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable String id, @RequestBody ProductRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equalsIgnoreCase(SELLER_KEY))) {
            return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Only sellers can update products"));
        }
        String userId = auth.getName();
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Product existing = opt.get();
        if (!userId.equals(existing.getUserId())) {
            return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Cannot modify another seller's product"));
        }
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setQuantity(request.getQuantity());
        existing.setImageIds(request.getImageIds());
        existing.setCategory(request.getCategory());
        repo.save(existing);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equalsIgnoreCase(SELLER_KEY))) {
            return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Only sellers can delete products"));
        }
        String userId = auth.getName();
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Product existing = opt.get();
        if (!userId.equals(existing.getUserId())) return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Cannot delete another seller's product"));
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Internal endpoint to append an image/media id to a product's imageIds list.
    // This endpoint expects an internal token in the X-Internal-Token header and is
    // intended for trusted services (e.g., media-service) to keep data in sync.
    @PostMapping("/{id}/images")
    public ResponseEntity<Object> addImage(@PathVariable String id, @RequestBody Map<String, String> body,
                                      @RequestHeader(value = "X-Internal-Token", required = false) String token) {
        String internalToken = System.getenv("INTERNAL_TOKEN");
        if (internalToken == null || !internalToken.equals(token)) {
            return ResponseEntity.status(403).body(Map.of(ERROR_KEY, "Forbidden"));
        }
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Product product = opt.get();
        String mediaId = body.get("mediaId");
        if (mediaId == null || mediaId.isBlank()) return ResponseEntity.badRequest().body(Map.of(ERROR_KEY, "mediaId required"));
        List<String> imgs = product.getImageIds();
        if (imgs == null) imgs = new ArrayList<>();
        imgs.add(mediaId);
        product.setImageIds(imgs);
        repo.save(product);
        return ResponseEntity.ok(product);
    }
}