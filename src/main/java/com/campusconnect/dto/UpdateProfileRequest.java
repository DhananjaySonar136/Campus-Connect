package com.campusconnect.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 60, message = "Name must be between 2 and 60 characters")
    private String name;

    @Size(min = 2, max = 120, message = "University name must be between 2 and 120 characters")
    private String university;

    @Size(max = 500, message = "Profile photo URL is too long")
    private String profilePhotoUrl;
}
