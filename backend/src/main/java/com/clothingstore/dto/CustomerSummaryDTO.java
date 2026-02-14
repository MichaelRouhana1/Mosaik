package com.clothingstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDTO {

    private Long userId;
    private String email;
    private String fullName;
    private Long totalOrders;
    private Double lifetimeSpend;
    private LocalDateTime lastOrderDate;
}
