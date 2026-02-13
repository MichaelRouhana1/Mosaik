package com.clothingstore.service;

import com.clothingstore.dto.CreateOrderRequest;
import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderItem;
import com.clothingstore.entity.OrderStatus;
import com.clothingstore.entity.Product;
import com.clothingstore.entity.ProductVariant;
import com.clothingstore.repository.OrderRepository;
import com.clothingstore.repository.ProductVariantRepository;
import com.clothingstore.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final int EMAIL_MAX_LENGTH = 255;

    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        String guestEmail = (request.getGuestEmail() != null && !request.getGuestEmail().isBlank())
                ? InputSanitizer.sanitizeText(request.getGuestEmail().trim(), EMAIL_MAX_LENGTH)
                : "guest@example.com";
        if (guestEmail == null || guestEmail.isBlank()) {
            guestEmail = "guest@example.com";
        }

        Order order = new Order();
        order.setGuestEmail(guestEmail);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(new ArrayList<>());

        double totalPrice = 0;

        for (var itemReq : request.getItems()) {
            String sku = itemReq.getSku() != null ? itemReq.getSku().trim() : null;
            if (sku == null || sku.isBlank()) {
                throw new IllegalArgumentException("SKU is required for each order item");
            }

            ProductVariant variant = productVariantRepository.findBySku(sku)
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found for SKU: " + sku));

            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            if (qty < 1) continue;

            if (variant.getStock() < qty) {
                throw new RuntimeException("Insufficient stock for " + variant.getProduct().getName() + " (Size " + variant.getSize() + "). Available: " + variant.getStock());
            }

            variant.setStock(variant.getStock() - qty);
            productVariantRepository.save(variant);

            Product product = variant.getProduct();
            String size = itemReq.getSize() != null ? itemReq.getSize() : variant.getSize();
            double lineTotal = product.getPrice() * qty;
            totalPrice += lineTotal;

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(qty);
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSize(size);
            orderItem.setSku(sku);
            orderItem.setImageUrl(product.getImageUrl());
            orderItem.setColor(product.getColor());
            orderItem.setProductVariant(variant);
            order.getItems().add(orderItem);
        }

        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }
}
