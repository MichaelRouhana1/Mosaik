package com.clothingstore.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class VariantRequest {

    @NotBlank(message = "Size is required")
    @Size(max = 20)
    private String size;

    @Min(0)
    private int stock = 0;
}
