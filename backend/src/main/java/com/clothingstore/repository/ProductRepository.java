package com.clothingstore.repository;

import com.clothingstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    List<Product> findByCategoryIgnoreCaseOrderByNameAsc(String category);
}
