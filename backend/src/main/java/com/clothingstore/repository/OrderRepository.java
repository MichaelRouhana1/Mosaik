package com.clothingstore.repository;

import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(String email);

    List<Order> findByGuestEmailIgnoreCaseAndStatusNotOrderByCreatedAtDesc(String email, OrderStatus status);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    double sumTotalPriceByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
