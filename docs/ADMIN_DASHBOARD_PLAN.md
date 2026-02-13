# Admin Dashboard – Implementation Plan

## Overview

This document outlines the implementation plan for a production-grade admin dashboard for the MOSAIK men's fashion e-commerce platform. The dashboard will allow store administrators to manage products, view orders, and monitor basic analytics.

---

## Current State

| Component | Status |
|-----------|--------|
| **Products** | GET only (list, filter by category) |
| **Orders** | POST only (create on checkout) |
| **Authentication** | None |
| **Frontend** | React + Vite + Tailwind |

---

## Phase 1: Authentication & Authorization ✅ Implemented

### 1.1 Backend – Admin Auth

**Goal:** Restrict admin endpoints to authenticated admins only.

**Approach options:**

| Option | Pros | Cons |
|--------|------|------|
| **A) Spring Security + JWT** | Industry standard, stateless | More setup, token management |
| **B) Simple API key** | Minimal setup, fast to ship | Less secure, no user identity |
| **C) Basic Auth + env config** | Quick to implement | Credentials in requests |

**Recommended:** **Option A** for production. **Option B** for fastest MVP (single admin API key in header).

**Implementation (Option A):**
- Add `spring-boot-starter-security` and `jjwt` dependencies
- Create `Admin` entity: `id`, `email`, `passwordHash`, `createdAt`
- `AdminRepository`, `AdminService`, `AuthController` (`POST /api/admin/login` → JWT)
- `JwtAuthFilter` + `SecurityConfig`: protect `/api/admin/**`, allow `/api/products`, `/api/orders` (POST)
- DTOs: `LoginRequest`, `LoginResponse` (token), `AdminResponse`

**Implementation (Option B – MVP):**
- Add `X-Admin-Key` header check in a `AdminAuthFilter` or interceptor
- Store admin key in `application.properties`: `admin.api-key=...`
- Apply to all `/api/admin/**` endpoints

### 1.2 Frontend – Auth Flow

- `AdminLogin` page at `/admin/login`
- Store JWT in `localStorage` or httpOnly cookie
- `AdminLayout` / `ProtectedRoute`: redirect to `/admin/login` if no token
- `AuthContext` or `useAdminAuth` hook for token and logout
- Attach `Authorization: Bearer <token>` to all admin API requests

---

## Phase 2: Admin API Endpoints ✅ Implemented

### 2.1 Product Management (CRUD)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/products` | List all (paginated, filter by category) |
| `GET` | `/api/admin/products/:id` | Get single product |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |

**DTOs:**
- `CreateProductRequest`: name, description, price, imageUrl, category, color
- `UpdateProductRequest`: same fields, all optional

**Image handling:** For MVP, keep `imageUrl` as string (URL or path). Phase 2.5: add file upload (`MultipartFile`) if needed.

### 2.2 Order Management (Read-only for MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/orders` | List all orders (paginated, sort by date) |
| `GET` | `/api/admin/orders/:id` | Get order with items |

**Optional later:**
- `PATCH /api/admin/orders/:id/status` – update status (Pending, Shipped, Delivered)

### 2.3 Dashboard Stats (Optional but useful)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Overview metrics |

**Response:**
```json
{
  "totalProducts": 23,
  "totalOrders": 156,
  "revenueLast30Days": 12450.00,
  "ordersLast7Days": 12
}
```

---

## Phase 3: Admin Frontend – Layout & Routes ✅ Implemented

### 3.1 Layout

- **Sidebar navigation** (collapsible on mobile)
- **Top bar** with admin email, logout
- **Content area** for page content
- **Styling:** Match MOSAIK neutral palette (black, grey, white), `rounded-none`, uppercase labels

### 3.2 Routes

| Path | Component | Description |
|------|-----------|--------------|
| `/admin` | Redirect to `/admin/dashboard` | — |
| `/admin/login` | AdminLogin | Login form |
| `/admin/dashboard` | AdminDashboard | Overview stats |
| `/admin/products` | AdminProducts | Product list + CRUD |
| `/admin/orders` | AdminOrders | Order list |

### 3.3 Sidebar Navigation

- Dashboard
- Products
- Orders
- Logout

---

## Phase 4: Admin Pages – Features ✅ Implemented

### 4.1 Dashboard

- Stat cards: Total Products, Total Orders, Revenue (30d), Recent Orders
- Simple table or list of last 5–10 orders

### 4.2 Products

- **Table:** Name, Category, Price, Color, Actions (Edit, Delete)
- **Search / filter** by category
- **Add Product** button → modal or separate page
- **Edit** → modal or `/admin/products/:id/edit`
- **Delete** → confirm dialog, then DELETE request

**Form fields:**
- Name (required)
- Description
- Price (required, number)
- Image URL (required)
- Category (dropdown: Jeans, Jackets, T-Shirts, Hoodies, Sweaters, etc.)
- Color (text or dropdown)

### 4.3 Orders

- **Table:** ID, Guest Email, Total, Date, View
- **Pagination**
- **View Order** → modal or `/admin/orders/:id` with line items (product name, qty, unit price)

---

## Phase 5: UX & Polish ✅ Implemented

- Loading states for all async actions
- Error handling (toast or inline messages)
- Success feedback on create/update/delete
- Responsive layout (sidebar collapse, table scroll on mobile)
- Logout clears token and redirects to `/admin/login`

---

## Implementation Order

1. **Phase 1.1** – Backend auth (API key or JWT)
2. **Phase 2.1** – Product CRUD API
3. **Phase 2.2** – Order list API
4. **Phase 3** – Admin layout and routes
5. **Phase 4.1** – Dashboard page (stats API + UI)
6. **Phase 4.2** – Products page (full CRUD UI)
7. **Phase 4.3** – Orders page
8. **Phase 5** – Polish

---

## File Structure (Proposed)

### Backend
```
com.clothingstore/
├── config/
│   ├── SecurityConfig.java
│   └── AdminAuthFilter.java (if using API key)
├── controller/
│   └── AdminController.java (or AdminProductController, AdminOrderController)
├── dto/
│   ├── CreateProductRequest.java
│   ├── UpdateProductRequest.java
│   └── AdminStatsResponse.java
├── entity/
│   └── Admin.java (if using JWT)
├── repository/
│   └── AdminRepository.java
└── service/
    └── AdminService.java
```

### Frontend
```
src/
├── admin/
│   ├── AdminLayout.tsx
│   ├── AdminLogin.tsx
│   ├── pages/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProducts.tsx
│   │   └── AdminOrders.tsx
│   └── components/
│       ├── AdminSidebar.tsx
│       ├── ProductForm.tsx
│       ├── ProductTable.tsx
│       └── OrderDetail.tsx
├── context/
│   └── AdminAuthContext.tsx
└── api/
    └── adminApi.ts (or admin.ts)
```

---

## Security Checklist

- [ ] Admin routes only accessible with valid token/API key
- [ ] No admin routes exposed to public
- [ ] CORS configured for admin frontend origin
- [ ] Passwords hashed (if using JWT)
- [ ] Token expiry and refresh (if using JWT)

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1 (Auth) | 4–8 hours |
| Phase 2 (API) | 4–6 hours |
| Phase 3 (Layout) | 2–3 hours |
| Phase 4 (Pages) | 6–10 hours |
| Phase 5 (Polish) | 2–4 hours |
| **Total** | **18–31 hours** |

---

## Next Steps

1. Choose auth approach (API key vs JWT)
2. Implement Phase 1 backend
3. Implement Phase 2.1 (Product CRUD)
4. Implement Phase 3 frontend layout
5. Build out admin pages incrementally
