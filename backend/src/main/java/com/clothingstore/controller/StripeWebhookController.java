package com.clothingstore.controller;

import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderStatus;
import com.clothingstore.repository.OrderRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final OrderRepository orderRepository;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("stripe.webhook.secret is not configured");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Webhook not configured");
        }
        if (sigHeader == null || sigHeader.isBlank()) {
            log.warn("Webhook received without Stripe-Signature header");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                String orderIdStr = session.getMetadata() != null ? session.getMetadata().get("order_id") : null;
                if (orderIdStr != null && !orderIdStr.isBlank()) {
                    try {
                        Long orderId = Long.parseLong(orderIdStr);
                        Order order = orderRepository.findById(orderId).orElse(null);
                        if (order != null) {
                            order.setStatus(OrderStatus.PAID);
                            orderRepository.save(order);
                            log.info("Order {} marked as PAID via webhook", orderId);
                        } else {
                            log.warn("Webhook: order {} not found", orderId);
                        }
                    } catch (NumberFormatException e) {
                        log.warn("Webhook: invalid order_id in metadata: {}", orderIdStr);
                    }
                } else {
                    log.warn("Webhook: no order_id in session metadata");
                }
            }
        }

        return ResponseEntity.ok().build();
    }
}
