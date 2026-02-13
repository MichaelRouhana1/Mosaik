package com.clothingstore.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkDiscountRequest {

    @NotEmpty(message = "At least one product ID is required")
    private List<Long> productIds;

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(value = "0", message = "Discount must be at least 0%")
    @DecimalMax(value = "100", message = "Discount cannot exceed 100%")
    private Double discountPercentage;
}
