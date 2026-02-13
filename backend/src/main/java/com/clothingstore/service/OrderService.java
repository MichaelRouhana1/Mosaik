package com.clothingstore.service;

import com.clothingstore.dto.CreateOrderRequest;
import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderItem;
import com.clothingstore.entity.Product;
import com.clothingstore.repository.OrderRepository;
import com.clothingstore.repository.ProductRepository;
import com.clothingstore.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int EMAIL_MAX_LENGTH = 255;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        List<Long> productIds = request.getItems().stream()
                .map(CreateOrderRequest.OrderItemRequest::getProductId)
                .collect(Collectors.toList());

        Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        String guestEmail = (request.getGuestEmail() != null && !request.getGuestEmail().isBlank())
                ? InputSanitizer.sanitizeText(request.getGuestEmail().trim(), EMAIL_MAX_LENGTH)
                : "guest@example.com";
        if (guestEmail == null || guestEmail.isBlank()) {
            guestEmail = "guest@example.com";
        }

        Order order = new Order();
        order.setGuestEmail(guestEmail);
        order.setItems(new ArrayList<>());

        double totalPrice = 0;

        for (var itemReq : request.getItems()) {
            Product product = productMap.get(itemReq.getProductId());
            if (product == null) {
                throw new IllegalArgumentException("Product not found: " + itemReq.getProductId());
            }
            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            if (qty < 1) continue;

            double lineTotal = product.getPrice() * qty;
            totalPrice += lineTotal;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(qty);
            orderItem.setUnitPrice(product.getPrice());
            order.getItems().add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }
}
