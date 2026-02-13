package com.clothingstore.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkDeleteRequest {

    @NotEmpty(message = "At least one product ID is required")
    private List<Long> productIds;
}
