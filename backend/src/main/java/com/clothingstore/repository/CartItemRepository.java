package com.clothingstore.repository;

import com.clothingstore.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.cart.id = :cartId")
    void deleteByCartId(Long cartId);
}
