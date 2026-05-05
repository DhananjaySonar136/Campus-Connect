package com.campusconnect.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ApiError {
    private boolean success;
    private String message;
    private List<FieldError> errors;
    private Instant timestamp;

    @Data
    @Builder
    public static class FieldError {
        private String field;
        private String message;
    }
}
