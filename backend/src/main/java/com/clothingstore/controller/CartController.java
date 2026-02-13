package com.clothingstore.controller;

import com.clothingstore.dto.UpdateCartRequest;
import lombok.RequiredArgsConstructor;
import com.clothingstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCart(Authentication auth) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            List<Map<String, Object>> items = cartService.getCart(email);
            return ResponseEntity.ok(Map.of("items", items));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping
    public ResponseEntity<?> updateCart(Authentication auth, @Valid @RequestBody UpdateCartRequest request) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            List<Map<String, Object>> items = cartService.updateCart(email, request);
            return ResponseEntity.ok(Map.of("items", items));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    private String getCustomerEmail(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String principal = auth.getName();
        if (!principal.startsWith("customer:")) return null;
        return principal.substring("customer:".length());
    }
}
