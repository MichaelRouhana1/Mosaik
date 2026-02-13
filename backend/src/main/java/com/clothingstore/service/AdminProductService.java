package com.clothingstore.service;

import com.clothingstore.dto.CreateProductRequest;
import com.clothingstore.dto.UpdateProductRequest;
import com.clothingstore.entity.Product;
import com.clothingstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(String category, String search, Pageable pageable) {
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        if (hasCategory && hasSearch) {
            return productRepository.findByCategoryIgnoreCaseAndNameContainingIgnoreCaseOrderByNameAsc(category, search.trim(), pageable);
        }
        if (hasCategory) {
            return productRepository.findByCategoryIgnoreCaseOrderByNameAsc(category, pageable);
        }
        if (hasSearch) {
            return productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(search.trim(), pageable);
        }
        return productRepository.findAllByOrderByNameAsc(pageable);
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    @Transactional
    public Product create(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null);
        product.setAdditionalImageUrls(request.getAdditionalImageUrls() != null ? request.getAdditionalImageUrls().trim() : null);
        product.setCategory(request.getCategory().trim());
        product.setColor(request.getColor() != null ? request.getColor().trim() : null);
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, UpdateProductRequest request) {
        Product product = getById(id);
        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription().trim());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getAdditionalImageUrls() != null) {
            product.setAdditionalImageUrls(request.getAdditionalImageUrls().trim());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            product.setCategory(request.getCategory().trim());
        }
        if (request.getColor() != null) {
            product.setColor(request.getColor().trim());
        }
        return productRepository.save(product);
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }
}
