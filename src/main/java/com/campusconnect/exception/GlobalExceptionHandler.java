package com.campusconnect.exception;

import com.campusconnect.dto.ApiError;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ── Validation errors (Bean Validation) ───────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        List<ApiError.FieldError> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> ApiError.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        ApiError error = ApiError.builder()
                .success(false)
                .message("Validation failed")
                .errors(fieldErrors)
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }

    // ── Duplicate email ───────────────────────────────────────────────────────
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailExists(EmailAlreadyExistsException ex) {
        ApiError error = ApiError.builder()
                .success(false)
                .message(ex.getMessage())
                .errors(List.of(ApiError.FieldError.builder()
                        .field("email")
                        .message("Email already registered")
                        .build()))
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // ── Password mismatch ─────────────────────────────────────────────────────
    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ApiError> handlePasswordMismatch(PasswordMismatchException ex) {
        ApiError error = ApiError.builder()
                .success(false)
                .message(ex.getMessage())
                .errors(List.of(ApiError.FieldError.builder()
                        .field("confirmPassword")
                        .message("Passwords do not match")
                        .build()))
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // ── Bad credentials / not found ───────────────────────────────────────────
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiError> handleAuthFailure(RuntimeException ex) {
        ApiError error = ApiError.builder()
                .success(false)
                .message("Invalid email or password")
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        ApiError error = ApiError.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex) {
        ApiError error = ApiError.builder()
                .success(false)
                .message(ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ── Catch-all ─────────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);

        ApiError error = ApiError.builder()
                .success(false)
                .message(ex.getMessage() == null ? "An unexpected error occurred. Please try again." : ex.getMessage())
                .timestamp(Instant.now())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
