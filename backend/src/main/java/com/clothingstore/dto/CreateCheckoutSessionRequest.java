package com.clothingstore.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCheckoutSessionRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    private String guestEmail;
}
