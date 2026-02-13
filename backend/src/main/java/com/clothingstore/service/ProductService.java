package com.clothingstore.service;

import com.clothingstore.entity.Product;
import com.clothingstore.repository.ProductRepository;
import com.clothingstore.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int CATEGORY_MAX_LENGTH = 100;

    private final ProductRepository productRepository;

    public List<Product> getAllProducts(String category) {
        String sanitized = InputSanitizer.sanitizeSearch(category, CATEGORY_MAX_LENGTH);
        if (sanitized != null && !sanitized.isBlank()) {
            return productRepository.findByVisibleTrueAndCategoryIgnoreCaseOrderByNameAsc(sanitized);
        }
        return productRepository.findByVisibleTrueOrderByNameAsc();
    }

    public Product getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (Boolean.FALSE.equals(p.getVisible())) {
            throw new RuntimeException("Product not found");
        }
        return p;
    }
}
