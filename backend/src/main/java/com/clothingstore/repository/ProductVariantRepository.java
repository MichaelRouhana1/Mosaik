package com.clothingstore.repository;

import com.clothingstore.entity.Product;
import com.clothingstore.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductOrderBySizeAsc(Product product);

    Optional<ProductVariant> findBySku(String sku);

    Optional<ProductVariant> findByProductAndSize(Product product, String size);
}
