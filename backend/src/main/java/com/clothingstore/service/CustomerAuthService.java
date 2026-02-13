package com.clothingstore.service;

import com.clothingstore.dto.LoginRequest;
import com.clothingstore.dto.LoginResponse;
import com.clothingstore.dto.RegisterRequest;
import com.clothingstore.entity.Customer;
import com.clothingstore.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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
