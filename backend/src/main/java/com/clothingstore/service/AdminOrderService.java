package com.clothingstore.service;

import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderStatus;
import com.clothingstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    @Transactional
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = getById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public long countOrdersSince(LocalDateTime since) {
        return orderRepository.countByCreatedAtBetween(since, LocalDateTime.now());
    }

    public double sumRevenueSince(LocalDateTime since) {
        return orderRepository.sumTotalPriceByCreatedAtBetween(since, LocalDateTime.now());
    }
}
