package com.clothingstore.controller;

import com.clothingstore.dto.AdminStatsResponse;
import com.clothingstore.repository.OrderRepository;
import com.clothingstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        double revenueLast30Days = orderRepository.sumTotalPriceByCreatedAtBetween(thirtyDaysAgo, LocalDateTime.now());

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long ordersLast7Days = orderRepository.countByCreatedAtBetween(sevenDaysAgo, LocalDateTime.now());

        AdminStatsResponse response = new AdminStatsResponse(
                totalProducts,
                totalOrders,
                revenueLast30Days,
                ordersLast7Days
        );
        return ResponseEntity.ok(response);
    }
}
