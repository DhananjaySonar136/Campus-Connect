package com.campusconnect.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private String university;
        private String profilePhotoUrl;
        private String role;
        private String approvalStatus;
        private String approvalNote;
        private Instant createdAt;
    }
}
