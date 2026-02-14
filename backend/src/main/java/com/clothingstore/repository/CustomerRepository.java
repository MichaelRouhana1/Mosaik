package com.clothingstore.repository;

import com.clothingstore.dto.CustomerSummaryDTO;
import com.clothingstore.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query(value = """
        SELECT c.id AS userId, c.email, c.name AS fullName,
               COUNT(o.id) AS totalOrders,
               COALESCE(SUM(CASE WHEN o.status IN ('PAID','PROCESSING','SHIPPED','DELIVERED') THEN o.total_price ELSE 0 END), 0) AS lifetimeSpend,
               MAX(o.created_at) AS lastOrderDate
        FROM customers c
        LEFT JOIN orders o ON LOWER(o.guest_email) = LOWER(c.email) AND o.status != 'CART'
        WHERE (:search IS NULL OR :search = '' OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
        GROUP BY c.id, c.email, c.name
        ORDER BY lifetimeSpend DESC NULLS LAST, c.name ASC
        """, nativeQuery = true)
    List<Object[]> findCustomerSummaries(@Param("search") String search);
}
