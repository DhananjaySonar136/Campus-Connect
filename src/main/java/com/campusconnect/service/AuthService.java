package com.campusconnect.service;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.RegisterRequest;
import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.exception.EmailAlreadyExistsException;
import com.campusconnect.exception.PasswordMismatchException;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private static final Set<String> HARDCODED_PLATFORM_ADMINS = Set.of(
            "myadmin@gmail.com"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Value("${app.platform.admin-emails:}")
    private String platformAdminEmails;

    // ── Register ──────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        // 2. Check for duplicate email
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "An account with email '" + request.getEmail() + "' already exists");
        }

        // 3. Build and persist user
        User.Role requestedRole = parseRequestedRole(request.getRequestedRole());
        boolean isPlatformAdmin = isPlatformAdminEmail(request.getEmail());

        User.Role role = isPlatformAdmin
                ? User.Role.PLATFORM_ADMIN
                : normalizeDbCompatibleRole(requestedRole);

        User.ApprovalStatus approvalStatus = isCollegeAdminRole(role)
                ? User.ApprovalStatus.PENDING
                : User.ApprovalStatus.APPROVED;

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase())
                .university(request.getUniversity().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .approvalStatus(approvalStatus)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} ({})", saved.getEmail(), saved.getId());

        // 4. Generate JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(saved.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .success(true)
                .message(buildRegistrationMessage(saved))
                .token(token)
                .user(toUserDto(saved))
                .build();
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .success(true)
                .message("Logged in successfully")
                .token(token)
                .user(toUserDto(user))
                .build();
    }

    // ── Get current user ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse.UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserDto(user);
    }

    @Transactional
    public AuthResponse.UserDto updateCurrentUser(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getUniversity() != null) {
            user.setUniversity(request.getUniversity().trim());
        }

        if (request.getProfilePhotoUrl() != null) {
            String photoUrl = request.getProfilePhotoUrl().trim();
            user.setProfilePhotoUrl(photoUrl.isEmpty() ? null : photoUrl);
        }

        User saved = userRepository.save(user);
        log.info("User profile updated: {}", saved.getEmail());
        return toUserDto(saved);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private AuthResponse.UserDto toUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .university(user.getUniversity())
                .profilePhotoUrl(user.getProfilePhotoUrl())
                .role(user.getRole().name())
                .approvalStatus(user.getApprovalStatus().name())
                .approvalNote(user.getApprovalNote())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private User.Role parseRequestedRole(String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return User.Role.STUDENT;
        }

        return User.Role.valueOf(requestedRole.trim().toUpperCase());
    }

    private boolean isPlatformAdminEmail(String email) {
        Set<String> adminEmails = Arrays.stream(platformAdminEmails.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        String normalizedEmail = email.toLowerCase();
        return adminEmails.contains(normalizedEmail) || HARDCODED_PLATFORM_ADMINS.contains(normalizedEmail);
    }

    private String buildRegistrationMessage(User user) {
        if (isCollegeAdminRole(user.getRole()) && user.getApprovalStatus() == User.ApprovalStatus.PENDING) {
            return "College admin request submitted. Your account will be activated after platform approval.";
        }
        return "Account created successfully! Welcome to Campus Connect.";
    }

    private User.Role normalizeDbCompatibleRole(User.Role role) {
        if (role == User.Role.COLLEGE_ADMIN) {
            return User.Role.ADMIN;
        }
        return role;
    }

    private boolean isCollegeAdminRole(User.Role role) {
        return role == User.Role.COLLEGE_ADMIN || role == User.Role.ADMIN;
    }
}
