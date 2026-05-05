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

1. Add PostgreSQL driver to `pom.xml` (already commented in)
2. Update `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/campusconnect
spring.datasource.username=your_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
```

3. Set a strong JWT secret (256-bit hex):
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
