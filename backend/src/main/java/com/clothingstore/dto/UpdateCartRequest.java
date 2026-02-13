package com.clothingstore.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class UpdateCartRequest {

    private List<@Valid CartItemRequest> items = new java.util.ArrayList<>();
}
