package com.clothingstore.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProductRequest {

    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String description;

    @Positive(message = "Price must be positive")
    private Double price;

    @Size(max = 500)
    private String imageUrl;

    @Size(max = 500)
    private String additionalImageUrls;

    @Size(max = 100)
    private String category;

    @Size(max = 50)
    private String color;
}
