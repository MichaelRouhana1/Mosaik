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
            return productRepository.findByCategoryIgnoreCaseOrderByNameAsc(sanitized);
        }
        return productRepository.findAllByOrderByNameAsc();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
