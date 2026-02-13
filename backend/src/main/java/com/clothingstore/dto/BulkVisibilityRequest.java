package com.clothingstore.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkVisibilityRequest {

    @NotEmpty(message = "At least one product ID is required")
    private List<Long> productIds;

    @NotNull(message = "Visible flag is required")
    private Boolean visible;
}
