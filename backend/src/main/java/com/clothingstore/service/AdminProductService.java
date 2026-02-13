package com.clothingstore.service;

import com.clothingstore.dto.CreateProductRequest;
import com.clothingstore.dto.UpdateProductRequest;
import com.clothingstore.dto.VariantRequest;
import com.clothingstore.entity.Product;
import com.clothingstore.entity.ProductVariant;
import com.clothingstore.repository.ProductRepository;
import com.clothingstore.repository.ProductVariantRepository;
import com.clothingstore.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private static final int SEARCH_MAX_LENGTH = 100;
    private static final int CATEGORY_MAX_LENGTH = 100;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public Page<Product> getAllProducts(String category, String search, Pageable pageable) {
        String sanitizedSearch = InputSanitizer.sanitizeSearch(search, SEARCH_MAX_LENGTH);
        String sanitizedCategory = InputSanitizer.sanitizeSearch(category, CATEGORY_MAX_LENGTH);
        boolean hasSearch = sanitizedSearch != null && !sanitizedSearch.isBlank();
        boolean hasCategory = sanitizedCategory != null && !sanitizedCategory.isBlank();

        if (hasCategory && hasSearch) {
            return productRepository.findByCategoryIgnoreCaseAndNameContainingIgnoreCaseOrderByNameAsc(sanitizedCategory, sanitizedSearch, pageable);
        }
        if (hasCategory) {
            return productRepository.findByCategoryIgnoreCaseOrderByNameAsc(sanitizedCategory, pageable);
        }
        if (hasSearch) {
            return productRepository.findByNameContainingIgnoreCaseOrderByNameAsc(sanitizedSearch, pageable);
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
        String name = InputSanitizer.sanitizeText(request.getName(), 255);
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required and must not contain only invalid characters");
        }
        product.setName(name);
        product.setDescription(InputSanitizer.sanitizeText(request.getDescription(), 1000));
        product.setPrice(request.getPrice());
        product.setImageUrl(InputSanitizer.sanitizeUrl(request.getImageUrl(), 500));
        product.setAdditionalImageUrls(sanitizeAdditionalImageUrls(request.getAdditionalImageUrls()));
        String category = InputSanitizer.sanitizeText(request.getCategory(), 100);
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category is required and must not contain only invalid characters");
        }
        product.setCategory(category);
        product.setColor(InputSanitizer.sanitizeText(request.getColor(), 50));
        product.setVisible(request.getVisible() != null ? request.getVisible() : true);
        product = productRepository.save(product);

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (VariantRequest vr : request.getVariants()) {
                if (vr.getSize() == null || vr.getSize().isBlank()) continue;
                String size = vr.getSize().trim();
                String sku = product.getId() + "-" + size;
                ProductVariant variant = new ProductVariant();
                variant.setProduct(product);
                variant.setSize(size);
                variant.setStock(Math.max(0, vr.getStock()));
                variant.setSku(sku);
                productVariantRepository.save(variant);
            }
        }

        return product;
    }

    private String sanitizeAdditionalImageUrls(String input) {
        if (input == null || input.isBlank()) return null;
        String[] urls = input.split(",");
        StringBuilder sb = new StringBuilder();
        for (String url : urls) {
            String sanitized = InputSanitizer.sanitizeUrl(url.trim(), 500);
            if (sanitized != null) {
                if (sb.length() > 0) sb.append(",");
                sb.append(sanitized);
            }
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    @Transactional
    public Product update(Long id, UpdateProductRequest request) {
        Product product = getById(id);
        if (request.getName() != null && !request.getName().isBlank()) {
            product.setName(InputSanitizer.sanitizeText(request.getName(), 255));
        }
        if (request.getDescription() != null) {
            product.setDescription(InputSanitizer.sanitizeText(request.getDescription(), 1000));
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(InputSanitizer.sanitizeUrl(request.getImageUrl(), 500));
        }
        if (request.getAdditionalImageUrls() != null) {
            product.setAdditionalImageUrls(sanitizeAdditionalImageUrls(request.getAdditionalImageUrls()));
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            product.setCategory(InputSanitizer.sanitizeText(request.getCategory(), 100));
        }
        if (request.getColor() != null) {
            product.setColor(InputSanitizer.sanitizeText(request.getColor(), 50));
        }
        if (request.getVisible() != null) {
            product.setVisible(request.getVisible());
        }
        Product savedProduct = productRepository.save(product);

        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                if (vr.getSize() == null || vr.getSize().isBlank()) continue;
                String size = vr.getSize().trim();
                productVariantRepository.findByProductAndSize(savedProduct, size)
                        .ifPresentOrElse(
                                existing -> {
                                    existing.setStock(Math.max(0, vr.getStock()));
                                    productVariantRepository.save(existing);
                                },
                                () -> {
                                    String sku = savedProduct.getId() + "-" + size;
                                    ProductVariant variant = new ProductVariant();
                                    variant.setProduct(savedProduct);
                                    variant.setSize(size);
                                    variant.setStock(Math.max(0, vr.getStock()));
                                    variant.setSku(sku);
                                    productVariantRepository.save(variant);
                                }
                        );
            }
        }

        return savedProduct;
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public void bulkDelete(List<Long> productIds) {
        for (Long id : productIds) {
            if (!productRepository.existsById(id)) {
                throw new RuntimeException("Product not found: " + id);
            }
            productRepository.deleteById(id);
        }
    }

    @Transactional
    public void bulkVisibility(List<Long> productIds, boolean visible) {
        for (Long id : productIds) {
            Product p = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id));
            p.setVisible(visible);
            productRepository.save(p);
        }
    }

    @Transactional
    public void bulkDiscount(List<Long> productIds, double discountPercentage) {
        double multiplier = 1.0 - (discountPercentage / 100.0);
        for (Long id : productIds) {
            Product p = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id));
            double newPrice = p.getPrice() * multiplier;
            p.setPrice(Math.max(0, newPrice));
            productRepository.save(p);
        }
    }
}
