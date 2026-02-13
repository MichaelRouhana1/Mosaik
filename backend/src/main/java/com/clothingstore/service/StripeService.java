package com.clothingstore.service;

import com.clothingstore.entity.Order;
import com.clothingstore.entity.OrderItem;
import com.clothingstore.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StripeService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final OrderRepository orderRepository;

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Creates a Stripe Checkout Session for the given order.
     * The orderId is stored in session metadata for retrieval in the webhook.
     */
    public String createCheckoutSession(Order order) throws StripeException {
        Long orderId = order.getId();
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            String productName = item.getProductName();
            if (productName == null || productName.isBlank()) {
                productName = "Product";
            }
            if (item.getSize() != null && !item.getSize().isBlank()) {
                productName += " (Size " + item.getSize() + ")";
            }

            long unitAmountCents = (long) Math.round(item.getUnitPrice() * 100);

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity((long) item.getQuantity())
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(unitAmountCents)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName(productName)
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();
            lineItems.add(lineItem);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/checkout/cancel")
                .addAllLineItem(lineItems)
                .putMetadata("order_id", orderId.toString())
                .build();

        com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.create(params);
        return session.getUrl();
    }
}
