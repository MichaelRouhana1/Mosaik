package com.clothingstore.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateProductRequest {

    private String name;
    private String description;

    @Positive(message = "Price must be positive")
    private Double price;

    private String imageUrl;

    private String additionalImageUrls;

    private String category;
    private String color;
}
