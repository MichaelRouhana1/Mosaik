package com.clothingstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDetailDTO {

    private Long userId;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
    private List<CustomerOrderSummaryDTO> orders;
}
