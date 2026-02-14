package com.clothingstore.controller;

import com.clothingstore.dto.CustomerDetailDTO;
import com.clothingstore.dto.CustomerSummaryDTO;
import com.clothingstore.service.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    public ResponseEntity<List<CustomerSummaryDTO>> list(@RequestParam(required = false) String search) {
        List<CustomerSummaryDTO> customers = adminCustomerService.getCustomerSummaries(search);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDTO> getById(@PathVariable Long id) {
        try {
            CustomerDetailDTO customer = adminCustomerService.getCustomerDetail(id);
            return ResponseEntity.ok(customer);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
