package com.clothingstore.util;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Sanitizes user input to prevent SQL injection, XSS, and other injection attacks.
 * Use with parameterized queries (JPA) - this adds defense in depth.
 */
public final class InputSanitizer {

    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\x00-\\x1F\\x7F]");
    private static final Pattern HTML_SCRIPT = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]+>");
    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    private InputSanitizer() {
    }

    /**
     * Sanitizes text input: removes control characters, strips HTML/script tags, limits length.
     */
    public static String sanitizeText(String input, int maxLength) {
        if (input == null) return null;
        String s = CONTROL_CHARS.matcher(input).replaceAll("");
        s = HTML_SCRIPT.matcher(s).replaceAll("");
        s = HTML_TAGS.matcher(s).replaceAll("");
        s = s.trim();
        if (s.length() > maxLength) {
            s = s.substring(0, maxLength);
        }
        return s.isEmpty() ? null : s;
    }

    /**
     * Sanitizes text for search: removes control characters, limits length. Keeps search chars like %.
     */
    public static String sanitizeSearch(String input, int maxLength) {
        if (input == null || input.isBlank()) return null;
        String s = CONTROL_CHARS.matcher(input).replaceAll("");
        s = s.trim();
        if (s.length() > maxLength) {
            s = s.substring(0, maxLength);
        }
        return s.isEmpty() ? null : s;
    }

    /**
     * Sanitizes URL: ensures it doesn't start with javascript:, data:, etc.
     */
    public static String sanitizeUrl(String input, int maxLength) {
        if (input == null) return null;
        String s = CONTROL_CHARS.matcher(input).replaceAll("");
        s = s.trim();
        String lower = s.toLowerCase();
        if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
            return null;
        }
        if (s.length() > maxLength) {
            s = s.substring(0, maxLength);
        }
        return s.isEmpty() ? null : s;
    }

    /**
     * Validates and returns safe file extension for uploads. Returns null if invalid.
     */
    public static String sanitizeFileExtension(String filename) {
        if (filename == null || filename.isBlank()) return null;
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return null;
        String ext = "." + filename.substring(dot + 1).toLowerCase();
        return ALLOWED_IMAGE_EXTENSIONS.contains(ext) ? ext : null;
    }
}
