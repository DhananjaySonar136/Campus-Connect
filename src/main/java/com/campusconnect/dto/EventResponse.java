package com.campusconnect.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class EventResponse {
    private String id;
    private String eventName;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String collegeName;
    private String city;
    private String state;
    private String category;
    private String description;
    private String organizerName;
    private String organizerEmail;
    private String contactPhone;
    private String registrationLink;
    private String bannerImageUrl;
    private String status;
    private String createdByUserId;
    private Instant createdAt;
}
