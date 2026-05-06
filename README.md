# Campus Connect — Java Backend (Spring Boot)

REST API for authentication built with **Spring Boot 3**, **Spring Security**, **JWT (JJWT)**, **JPA/H2**, and **BCrypt**.

---

## Project Structure

```
campus-connect-java/
├── pom.xml                                         # Maven build file
└── src/
    ├── main/
    │   ├── java/com/campusconnect/
    │   │   ├── CampusConnectApplication.java       # Entry point
    │   │   ├── config/
    │   │   │   └── SecurityConfig.java             # Spring Security + CORS
    │   │   ├── controller/
    │   │   │   ├── AuthController.java             # POST /register, /login, GET /me
    │   │   │   └── HealthController.java           # GET /health
    │   │   ├── dto/
    │   │   │   ├── RegisterRequest.java            # Request body with @Valid
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── AuthResponse.java               # Unified success response
    │   │   │   └── ApiError.java                  # Unified error response
    │   │   ├── exception/
    │   │   │   ├── GlobalExceptionHandler.java     # @RestControllerAdvice
    │   │   │   ├── EmailAlreadyExistsException.java
    │   │   │   └── PasswordMismatchException.java
    │   │   ├── model/
    │   │   │   └── User.java                      # JPA entity
    │   │   ├── repository/
    │   │   │   └── UserRepository.java            # Spring Data JPA
    │   │   ├── security/
    │   │   │   ├── JwtService.java                # Token generation & validation
    │   │   │   ├── JwtAuthFilter.java             # OncePerRequestFilter
    │   │   │   └── UserDetailsServiceImpl.java    # Loads user from DB
    │   │   └── service/
    │   │       └── AuthService.java               # Business logic
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/campusconnect/
            └── AuthControllerTest.java            # Integration tests
```

---

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+

### Run

```bash
# Clone / unzip the project, then:
cd campus-connect-java

# Build and run
mvn spring-boot:run

# Server starts on http://localhost:8080
```

### Run tests

```bash
mvn test
```

### Build JAR for deployment

```bash
mvn clean package -DskipTests
java -jar target/campus-connect-backend-1.0.0.jar
```

---

## API Reference

Base URL: `http://localhost:8080`

### POST `/api/auth/register`

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@university.edu",
  "university": "MIT",
  "password": "SecurePass1",
  "confirmPassword": "SecurePass1"
}
```

**Success 201:**
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to Campus Connect.",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid-v4",
    "name": "Jane Smith",
    "email": "jane@university.edu",
    "university": "MIT",
    "role": "STUDENT",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error 422 (validation):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must contain at least one uppercase letter and one number" }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error 409 (duplicate email):**
```json
{
  "success": false,
  "message": "An account with email 'jane@university.edu' already exists",
  "errors": [{ "field": "email", "message": "Email already registered" }]
}
```

---

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "jane@university.edu",
  "password": "SecurePass1"
}
```

**Success 200:** Same shape as register response.

**Error 401:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET `/api/auth/me` (Protected)

**Header:** `Authorization: Bearer <your_jwt_token>`

**Success 200:**
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@university.edu",
  "university": "MIT",
  "role": "STUDENT",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## H2 Console (dev only)

Available at: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:campusconnectdb`
- Username: `sa`
- Password: _(empty)_

---

## Password Rules

| Rule | Constraint |
|------|-----------|
| Minimum length | 8 characters |
| Uppercase required | At least 1 (A-Z) |
| Number required | At least 1 (0-9) |
| BCrypt rounds | 12 |

---

## Switching to PostgreSQL (Production)

The project now has two database profiles:

| Profile | Database | Use |
|---------|----------|-----|
| `dev` | H2 in-memory | Default local development/tests |
| `supabase` | Supabase Postgres | Real cloud database |

### Supabase Setup

1. Open Supabase dashboard.
2. Go to **Project Settings > Database**.
3. Copy your Postgres connection details.
4. Convert the Supabase connection string to JDBC format and set these environment variables.

Supabase may show a URL like:

```text
postgresql://USER:PASSWORD@HOST:PORT/postgres
```

Use it like this:

```powershell
$env:SPRING_PROFILES_ACTIVE="supabase"
$env:SUPABASE_DB_URL="jdbc:postgresql://HOST:PORT/postgres?sslmode=require"
$env:SUPABASE_DB_USER="USER"
$env:SUPABASE_DB_PASSWORD="YOUR_SUPABASE_DATABASE_PASSWORD"
$env:JWT_SECRET="REPLACE_WITH_A_256_BIT_SECRET"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

For the direct connection, `USER` is often `postgres`. For the pooler connection, `USER` may look like `postgres.YOUR_PROJECT_REF`.

If your internet provider does not support IPv6, use the Supabase pooler host instead of the direct database host. Keep the same JDBC format:

```text
jdbc:postgresql://YOUR_POOLER_HOST:6543/postgres?sslmode=require
```

Then run:

```powershell
mvn spring-boot:run
```

Hibernate will create/update the `users` table automatically because the Supabase profile uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For production deployments, prefer migrations and set:

```powershell
$env:JPA_DDL_AUTO="validate"
```

Set a strong JWT secret with:

```bash
openssl rand -hex 32
```

---

## Security Architecture

```
Request
  └── JwtAuthFilter (OncePerRequestFilter)
        ├── Extract Bearer token from Authorization header
        ├── Validate token via JwtService (HMAC-SHA256)
        ├── Load UserDetails from DB
        └── Set SecurityContext authentication

SecurityConfig
  ├── CSRF disabled (stateless JWT)
  ├── CORS configured for frontend origin
  ├── Public: POST /api/auth/register, POST /api/auth/login
  └── Protected: everything else requires valid JWT

Passwords
  └── BCryptPasswordEncoder (strength=12)
```

---

## Frontend Integration (React)

Update `frontend/src/services/api.js`:
```js
const api = axios.create({
  baseURL: 'http://localhost:8080/api',   // Java backend
  ...
});
```

No other frontend changes needed — the API contract is identical to the Node.js version.
