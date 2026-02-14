package com.clothingstore.service;

import com.clothingstore.dto.CustomerDetailDTO;
import com.clothingstore.dto.CustomerOrderSummaryDTO;
import com.clothingstore.dto.CustomerSummaryDTO;
import com.clothingstore.entity.Customer;
import com.clothingstore.entity.Order;
import com.clothingstore.repository.CustomerRepository;
import com.clothingstore.repository.OrderRepository;
import com.clothingstore.util.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminCustomerService {

    private static final int SEARCH_MAX_LENGTH = 100;

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<CustomerSummaryDTO> getCustomerSummaries(String search) {
        String sanitized = InputSanitizer.sanitizeSearch(search, SEARCH_MAX_LENGTH);
        String searchParam = (sanitized != null && !sanitized.isBlank()) ? sanitized : null;

        List<Object[]> rows = customerRepository.findCustomerSummaries(searchParam);

        return rows.stream()
                .map(row -> new CustomerSummaryDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        row[2] != null ? (String) row[2] : "",
                        ((Number) row[3]).longValue(),
                        ((Number) row[4]).doubleValue(),
                        toLocalDateTime(row[5])
                ))
                .collect(Collectors.toList());
    }

    private static java.time.LocalDateTime toLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof java.sql.Timestamp ts) return ts.toLocalDateTime();
        if (o instanceof java.time.LocalDateTime ldt) return ldt;
        return null;
    }

    @Transactional(readOnly = true)
    public CustomerDetailDTO getCustomerDetail(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));

        List<Order> orders = orderRepository.findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(customer.getEmail());

        List<CustomerOrderSummaryDTO> orderSummaries = orders.stream()
                .filter(o -> o.getStatus() != null && !"CART".equals(o.getStatus().name()))
                .map(o -> new CustomerOrderSummaryDTO(
                        o.getId(),
                        o.getCreatedAt(),
                        o.getStatus().name(),
                        o.getTotalPrice()
                ))
                .collect(Collectors.toList());

        return new CustomerDetailDTO(
                customer.getId(),
                customer.getEmail(),
                customer.getName() != null ? customer.getName() : "",
                customer.getCreatedAt(),
                orderSummaries
        );
    }
}
