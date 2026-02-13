package com.clothingstore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    private String name;

    @jakarta.validation.constraints.AssertTrue(message = "Passwords do not match")
    public boolean isPasswordMatch() {
        return password == null || confirmPassword == null || password.equals(confirmPassword);
    }
}
