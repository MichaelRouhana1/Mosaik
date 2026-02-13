package com.clothingstore.repository;

import com.clothingstore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    List<Product> findByCategoryIgnoreCaseOrderByNameAsc(String category);

    List<Product> findByVisibleTrueOrderByNameAsc();

    List<Product> findByVisibleTrueAndCategoryIgnoreCaseOrderByNameAsc(String category);

    Page<Product> findAllByOrderByNameAsc(Pageable pageable);

    Page<Product> findByCategoryIgnoreCaseOrderByNameAsc(String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY p.name ASC")
    Page<Product> findByNameContainingIgnoreCaseOrderByNameAsc(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category) = LOWER(:category) AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY p.name ASC")
    Page<Product> findByCategoryIgnoreCaseAndNameContainingIgnoreCaseOrderByNameAsc(@Param("category") String category, @Param("search") String search, Pageable pageable);
}
