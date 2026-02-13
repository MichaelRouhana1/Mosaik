package com.clothingstore.controller;

import com.clothingstore.dto.ChangePasswordRequest;
import com.clothingstore.dto.DeleteAccountRequest;
import com.clothingstore.dto.LoginRequest;
import com.clothingstore.dto.LoginResponse;
import com.clothingstore.dto.RegisterRequest;
import com.clothingstore.dto.UpdateProfileRequest;
import com.clothingstore.entity.Order;
import com.clothingstore.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            LoginResponse response = customerAuthService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = customerAuthService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(customerAuthService.getProfile(email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(Authentication auth, @Valid @RequestBody UpdateProfileRequest request) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(customerAuthService.updateProfile(email, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest request) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            customerAuthService.changePassword(email, request);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Authentication auth, @Valid @RequestBody DeleteAccountRequest request) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            customerAuthService.deleteAccount(email, request);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getOrders(Authentication auth) {
        String email = getCustomerEmail(auth);
        if (email == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(customerAuthService.getOrders(email));
    }

    private String getCustomerEmail(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String principal = auth.getName();
        if (!principal.startsWith("customer:")) return null;
        return principal.substring("customer:".length());
    }
}
