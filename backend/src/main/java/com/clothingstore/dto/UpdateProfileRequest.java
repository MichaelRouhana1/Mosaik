package com.clothingstore.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 255)
    private String name;

    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;
}
