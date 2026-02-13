package com.clothingstore.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter for login endpoints to prevent brute-force attacks.
 * Tracks attempts per IP address using a sliding window.
 */
@Component
public class LoginRateLimiter {

    @Value("${app.rate-limit.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.rate-limit.login.window-minutes:15}")
    private int windowMinutes;

    private final Map<String, RateLimitEntry> attempts = new ConcurrentHashMap<>();

    /**
     * Returns true if the request is allowed, false if rate limited.
     */
    public boolean tryConsume(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return true; // Cannot rate limit without IP
        }
        long now = System.currentTimeMillis();
        long windowMs = windowMinutes * 60L * 1000;

        attempts.entrySet().removeIf(e -> now - e.getValue().windowStart > windowMs);

        RateLimitEntry entry = attempts.compute(clientIp, (k, v) -> {
            if (v == null || now - v.windowStart > windowMs) {
                return new RateLimitEntry(1, now);
            }
            return new RateLimitEntry(v.count + 1, v.windowStart);
        });

        return entry.count <= maxAttempts;
    }

    /**
     * Resets the count for an IP (e.g., after successful login).
     */
    public void reset(String clientIp) {
        if (clientIp != null) {
            attempts.remove(clientIp);
        }
    }

    private record RateLimitEntry(int count, long windowStart) {
    }
}
