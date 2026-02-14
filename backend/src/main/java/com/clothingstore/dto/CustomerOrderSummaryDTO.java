package com.clothingstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderSummaryDTO {

    private Long id;
    private LocalDateTime createdAt;
    private String status;
    private Double totalPrice;
}
