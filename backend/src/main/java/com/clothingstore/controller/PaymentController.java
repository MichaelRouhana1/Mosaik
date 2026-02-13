package com.clothingstore.controller;

import com.clothingstore.dto.CreateCheckoutSessionRequest;
import com.clothingstore.entity.Order;
import com.clothingstore.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            Authentication auth,
            @Valid @RequestBody CreateCheckoutSessionRequest request) {
        try {
            Order order = stripeService.getOrderById(request.getOrderId());
            String userEmail = getCustomerEmail(auth);

            if (userEmail != null) {
                if (!order.getGuestEmail().equalsIgnoreCase(userEmail)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Order does not belong to the authenticated user"));
                }
            } else {
                String guestEmail = request.getGuestEmail();
                if (guestEmail == null || guestEmail.isBlank() ||
                        !order.getGuestEmail().equalsIgnoreCase(guestEmail.trim())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("message", "Order does not belong to this email"));
                }
            }

            String url = stripeService.createCheckoutSession(order);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    private String getCustomerEmail(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String principal = auth.getName();
        if (!principal.startsWith("customer:")) return null;
        return principal.substring("customer:".length());
    }
}
