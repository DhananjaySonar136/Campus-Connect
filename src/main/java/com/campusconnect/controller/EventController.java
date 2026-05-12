package com.campusconnect.controller;

import com.campusconnect.dto.CreateEventRequest;
import com.campusconnect.dto.EventResponse;
import com.campusconnect.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> listPublishedEvents() {
        return ResponseEntity.ok(eventService.listPublishedEvents());
    }

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateEventRequest request
    ) {
        EventResponse event = eventService.createEvent(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
}
