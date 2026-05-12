package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 100)
    private String university;

    @Column(length = 500)
    private String profilePhotoUrl;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.STUDENT;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.APPROVED;

    @Column(length = 500)
    private String approvalNote;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public enum Role {
        STUDENT, ADMIN, COLLEGE_ADMIN, PLATFORM_ADMIN
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
