package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 140)
    private String eventName;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 180)
    private String venue;

    @Column(nullable = false, length = 120)
    private String collegeName;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(length = 2000, nullable = false)
    private String description;

    @Column(nullable = false, length = 140)
    private String organizerName;

    @Column(nullable = false, length = 120)
    private String organizerEmail;

    @Column(nullable = false, length = 30)
    private String contactPhone;

    @Column(length = 500)
    private String registrationLink;

    @Column(length = 500)
    private String bannerImageUrl;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.PUBLISHED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public enum EventStatus {
        PUBLISHED, CANCELLED
    }
}
