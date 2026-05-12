package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateEventRequest {
    @NotBlank
    @Size(min = 3, max = 140)
    private String eventName;

    @NotNull
    private LocalDate eventDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    @Size(min = 2, max = 180)
    private String venue;

    @NotBlank
    @Size(min = 2, max = 120)
    private String collegeName;

    @NotBlank
    @Size(min = 2, max = 100)
    private String city;

    @NotBlank
    @Size(min = 2, max = 100)
    private String state;

    @NotBlank
    @Size(min = 2, max = 80)
    private String category;

    @NotBlank
    @Size(min = 20, max = 2000)
    private String description;

    @NotBlank
    @Size(min = 2, max = 140)
    private String organizerName;

    @NotBlank
    @Size(min = 5, max = 120)
    private String organizerEmail;

    @NotBlank
    @Size(min = 7, max = 30)
    private String contactPhone;

    @Size(max = 500)
    private String registrationLink;

    @Size(max = 500)
    private String bannerImageUrl;
}
