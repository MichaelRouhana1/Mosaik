package com.clothingstore.config;

import com.clothingstore.entity.Admin;
import com.clothingstore.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Admin admin = adminRepository.findByEmail("admin@mosaik.com")
                .orElse(new Admin());
        admin.setEmail("admin@mosaik.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        adminRepository.save(admin);
    }
}
