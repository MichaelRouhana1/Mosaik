# Clothing Store - Full-Stack Application

A full-stack clothing store website with a **Spring Boot** backend and a **React** frontend built with Vite and Tailwind CSS.

## Project Structure

```
Mosaik/
├── backend/          # Java Spring Boot API
├── frontend/         # React + Vite + Tailwind CSS
└── README.md
```

## Prerequisites

- **JDK 17 or 21** (for Spring Boot 3+)
- **Node.js 18+** and **npm** (for the React frontend)
- **PostgreSQL** (for the backend database)
- **Maven** (bundled with backend, or install separately)

---

## Quick Start

### 1. Backend (Spring Boot)

1. **Create the PostgreSQL database:**

   ```sql
   CREATE DATABASE clothing_store;
   ```

2. **Update database credentials** in `backend/src/main/resources/application.properties` if needed:
   - `spring.datasource.url`
   - `spring.datasource.username`
   - `spring.datasource.password`

3. **Run the backend:**

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   The API will be available at **http://localhost:8080**

### 2. Frontend (React + Vite)

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at **http://localhost:5173**

---

## Tech Stack

| Layer   | Technologies                                      |
|---------|---------------------------------------------------|
| Backend | Java 17, Spring Boot 3, Spring Web, JPA, PostgreSQL, Lombok |
| Frontend| React, TypeScript, Vite, Tailwind CSS             |

---

## Development Commands

### Backend

| Command              | Description                    |
|----------------------|--------------------------------|
| `mvn spring-boot:run`| Start the Spring Boot server   |
| `mvn test`           | Run tests                      |
| `mvn clean package`  | Build a JAR for production     |

### Frontend

| Command       | Description                    |
|---------------|--------------------------------|
| `npm run dev` | Start Vite dev server          |
| `npm run build` | Build for production         |
| `npm run preview` | Preview production build   |
| `npm run lint` | Run ESLint                   |

---

## Configuration

### Backend

- **Port:** 8080 (configurable in `application.properties`)
- **Database:** PostgreSQL on `localhost:5432`, database name `clothing_store`

### Frontend

- **Port:** 5173 (Vite default)
- **API URL:** Configure in your frontend code to point to `http://localhost:8080` when making API calls

---

## Next Steps

- Add product models and REST endpoints in the backend
- Create React components for product listing, cart, and checkout
- Configure CORS to allow frontend–backend communication
- Add authentication (e.g., Spring Security + JWT)
