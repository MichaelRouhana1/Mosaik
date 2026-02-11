package com.clothingstore.service;

import com.clothingstore.entity.Product;
import com.clothingstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByNameAsc();
    }
}
