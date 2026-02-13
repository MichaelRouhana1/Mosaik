# Security Practices

## Rate Limiting

- **Login endpoints** (`/api/auth/login`, `/api/admin/login`) are rate limited per IP:
  - Default: 5 attempts per 15 minutes
  - Configurable via `app.rate-limit.login.max-attempts` and `app.rate-limit.login.window-minutes`
  - Returns HTTP 429 (Too Many Requests) when exceeded
  - Protects against brute-force password guessing

## Input Sanitization

### Backend (Java/Spring)

- **InputSanitizer** (`util/InputSanitizer.java`) sanitizes all user input:
  - **Text fields**: Removes control characters, strips HTML/script tags, enforces max length
  - **Search/category**: Removes control characters, limits length (used in product search)
  - **URLs**: Rejects `javascript:`, `data:`, `vbscript:` schemes; enforces max length
  - **File uploads**: Whitelist of extensions (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`)

- **Validation**: DTOs use `@Size`, `@NotBlank`, `@Email` etc. for input validation

- **SQL Injection**: All queries use JPA parameterized queries (`:param`); no string concatenation

### Frontend (React)

- **XSS**: React escapes all `{variable}` output by default. Never use `dangerouslySetInnerHTML` with user content unless sanitized (e.g. with DOMPurify)

- **User content** (product names, descriptions, etc.) is rendered as text and is safe
