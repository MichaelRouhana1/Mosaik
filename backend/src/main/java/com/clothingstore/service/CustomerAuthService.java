package com.clothingstore.service;

import com.clothingstore.dto.ChangePasswordRequest;
import com.clothingstore.dto.LoginRequest;
import com.clothingstore.dto.LoginResponse;
import com.clothingstore.dto.RegisterRequest;
import com.clothingstore.dto.UpdateProfileRequest;
import com.clothingstore.entity.Customer;
import com.clothingstore.entity.Order;
import com.clothingstore.repository.CustomerRepository;
import com.clothingstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Map<String, Object> getProfile(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return Map.of(
                "email", customer.getEmail(),
                "name", customer.getName() != null ? customer.getName() : ""
        );
    }

    @Transactional
    public Map<String, Object> updateProfile(String currentEmail, UpdateProfileRequest request) {
        Customer customer = customerRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (request.getName() != null) {
            customer.setName(request.getName().trim().isEmpty() ? null : request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equals(currentEmail) && customerRepository.existsByEmail(newEmail)) {
                throw new RuntimeException("Email already in use");
            }
            customer.setEmail(newEmail);
        }
        customerRepository.save(customer);

        return Map.of(
                "email", customer.getEmail(),
                "name", customer.getName() != null ? customer.getName() : ""
        );
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), customer.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
    }

    @Transactional
    public void deleteAccount(String email, com.clothingstore.dto.DeleteAccountRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new RuntimeException("Password is incorrect");
        }
        customerRepository.delete(customer);
    }

    public java.util.List<Order> getOrders(String email) {
        return orderRepository.findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(email);
    }

    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (customerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setName(request.getName() != null ? request.getName().trim() : null);
        customerRepository.save(customer);

        String token = jwtService.generateToken("customer:" + email);
        return new LoginResponse(token, email);
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken("customer:" + email);
        return new LoginResponse(token, email);
    }
}
