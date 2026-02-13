package com.clothingstore.service;

import com.clothingstore.dto.CartItemRequest;
import com.clothingstore.dto.UpdateCartRequest;
import com.clothingstore.entity.Cart;
import com.clothingstore.entity.CartItem;
import com.clothingstore.entity.Customer;
import com.clothingstore.entity.Product;
import com.clothingstore.repository.CartRepository;
import com.clothingstore.repository.CustomerRepository;
import com.clothingstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public List<Map<String, Object>> getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return cart.getItems().stream()
                .map(this::toResponseItem)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Map<String, Object>> updateCart(String email, UpdateCartRequest request) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();

        java.util.Map<String, CartItemRequest> consolidated = new java.util.LinkedHashMap<>();
        for (CartItemRequest req : request.getItems()) {
            if (req.getQuantity() < 1) continue;
            String key = (req.getSku() != null && !req.getSku().isBlank())
                    ? req.getSku()
                    : req.getProductId() + ":" + (req.getSize() != null ? req.getSize() : "");
            CartItemRequest existing = consolidated.get(key);
            if (existing != null) {
                existing.setQuantity(existing.getQuantity() + req.getQuantity());
            } else {
                consolidated.put(key, req);
            }
        }

        for (CartItemRequest req : consolidated.values()) {
            Product product = productRepository.findById(req.getProductId()).orElse(null);
            if (product == null) continue;

            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(req.getQuantity());
            item.setSize(req.getSize());
            String sku = (req.getSku() != null && !req.getSku().isBlank())
                    ? req.getSku()
                    : req.getProductId() + "-" + (req.getSize() != null ? req.getSize() : "");
            item.setSku(sku);
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
        return cart.getItems().stream().map(this::toResponseItem).collect(Collectors.toList());
    }

    private Cart getOrCreateCart(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return cartRepository.findByCustomer(customer)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomer(customer);
                    cart.setItems(new ArrayList<>());
                    return cartRepository.save(cart);
                });
    }

    private Map<String, Object> toResponseItem(CartItem item) {
        Product p = item.getProduct();
        String sku = item.getSku() != null && !item.getSku().isBlank()
                ? item.getSku()
                : p.getId() + "-" + (item.getSize() != null ? item.getSize() : "");
        return Map.of(
                "productId", p.getId(),
                "quantity", item.getQuantity(),
                "size", item.getSize() != null ? item.getSize() : "",
                "sku", sku,
                "product", Map.of(
                        "id", p.getId(),
                        "name", p.getName(),
                        "description", p.getDescription() != null ? p.getDescription() : "",
                        "price", p.getPrice(),
                        "imageUrl", p.getImageUrl() != null ? p.getImageUrl() : "",
                        "additionalImageUrls", p.getAdditionalImageUrls() != null ? p.getAdditionalImageUrls() : "",
                        "category", p.getCategory(),
                        "color", p.getColor() != null ? p.getColor() : "",
                        "sizes", p.getSizes() != null ? p.getSizes() : ""
                )
        );
    }
}
