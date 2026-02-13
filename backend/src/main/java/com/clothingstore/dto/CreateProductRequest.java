package com.clothingstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateProductRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @Size(max = 500)
    private String imageUrl;

    @Size(max = 500)
    private String additionalImageUrls;

    @NotBlank(message = "Category is required")
    @Size(max = 100)
    private String category;

    @Size(max = 50)
    private String color;

    private Boolean visible = true;

    private List<@Valid VariantRequest> variants;
}
