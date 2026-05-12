package com.campusconnect.service;

import com.campusconnect.dto.CreateEventRequest;
import com.campusconnect.dto.EventResponse;
import com.campusconnect.model.Event;
import com.campusconnect.model.User;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventResponse createEvent(String userEmail, CreateEventRequest request) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean canCreate = user.getRole() == User.Role.PLATFORM_ADMIN
                || ((user.getRole() == User.Role.COLLEGE_ADMIN || user.getRole() == User.Role.ADMIN)
                && user.getApprovalStatus() == User.ApprovalStatus.APPROVED);

        if (!canCreate) {
            throw new IllegalStateException("Only approved college admins can create events.");
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        Event event = Event.builder()
                .eventName(request.getEventName().trim())
                .eventDate(request.getEventDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .venue(request.getVenue().trim())
                .collegeName(request.getCollegeName().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription().trim())
                .organizerName(request.getOrganizerName().trim())
                .organizerEmail(request.getOrganizerEmail().trim().toLowerCase())
                .contactPhone(request.getContactPhone().trim())
                .registrationLink(trimOrNull(request.getRegistrationLink()))
                .bannerImageUrl(trimOrNull(request.getBannerImageUrl()))
                .status(Event.EventStatus.PUBLISHED)
                .createdBy(user)
                .build();

        return toResponse(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> listPublishedEvents() {
        return eventRepository.findAllByStatusOrderByEventDateAscStartTimeAsc(Event.EventStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .eventName(event.getEventName())
                .eventDate(event.getEventDate())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .venue(event.getVenue())
                .collegeName(event.getCollegeName())
                .city(event.getCity())
                .state(event.getState())
                .category(event.getCategory())
                .description(event.getDescription())
                .organizerName(event.getOrganizerName())
                .organizerEmail(event.getOrganizerEmail())
                .contactPhone(event.getContactPhone())
                .registrationLink(event.getRegistrationLink())
                .bannerImageUrl(event.getBannerImageUrl())
                .status(event.getStatus().name())
                .createdByUserId(event.getCreatedBy().getId())
                .createdAt(event.getCreatedAt())
                .build();
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
