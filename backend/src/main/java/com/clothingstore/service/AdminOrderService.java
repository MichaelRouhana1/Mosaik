package com.clothingstore.service;

import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderItem;
import com.clothingstore.entity.OrderStatus;
import com.clothingstore.repository.OrderRepository;
import com.clothingstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Order getById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        enrichOrderItemsWithProductDetails(order);
        return order;
    }

    private void enrichOrderItemsWithProductDetails(Order order) {
        for (OrderItem item : order.getItems()) {
            if ((item.getImageUrl() == null || item.getImageUrl().isBlank() || item.getColor() == null || item.getColor().isBlank())
                    && item.getProductId() != null) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    if (item.getImageUrl() == null || item.getImageUrl().isBlank()) {
                        item.setImageUrl(product.getImageUrl());
                    }
                    if (item.getColor() == null || item.getColor().isBlank()) {
                        item.setColor(product.getColor());
                    }
                });
            }
        }
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
