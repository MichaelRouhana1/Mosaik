package com.clothingstore.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalProducts;
    private long totalOrders;
    private double revenueLast30Days;
    private long ordersLast7Days;
}
