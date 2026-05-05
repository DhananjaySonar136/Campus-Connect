package com.campusconnect.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 60, message = "Name must be between 2 and 60 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "University name is required")
    @Size(min = 2, max = 120, message = "University name must be between 2 and 120 characters")
    private String university;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9]).+$",
        message = "Password must contain at least one uppercase letter and one number"
    )
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;
}
