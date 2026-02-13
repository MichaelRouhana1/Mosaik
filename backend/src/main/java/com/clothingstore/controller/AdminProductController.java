package com.clothingstore.controller;

import com.clothingstore.dto.BulkDeleteRequest;
import com.clothingstore.dto.BulkDiscountRequest;
import com.clothingstore.dto.BulkVisibilityRequest;
import com.clothingstore.dto.CreateProductRequest;
import com.clothingstore.dto.UpdateProductRequest;
import com.clothingstore.entity.Product;
import com.clothingstore.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public ResponseEntity<Page<Product>> list(
            @RequestParam(required = false) String cat,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = adminProductService.getAllProducts(cat, search, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        try {
            Product product = adminProductService.getById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody CreateProductRequest request) {
        Product product = adminProductService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        try {
            Product product = adminProductService.update(id, request);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDelete(@Valid @RequestBody BulkDeleteRequest request) {
        try {
            adminProductService.bulkDelete(request.getProductIds());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            adminProductService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/bulk-visibility")
    public ResponseEntity<Void> bulkVisibility(@Valid @RequestBody BulkVisibilityRequest request) {
        try {
            adminProductService.bulkVisibility(request.getProductIds(), request.getVisible());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/bulk-discount")
    public ResponseEntity<Void> bulkDiscount(@Valid @RequestBody BulkDiscountRequest request) {
        try {
            adminProductService.bulkDiscount(request.getProductIds(), request.getDiscountPercentage());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
