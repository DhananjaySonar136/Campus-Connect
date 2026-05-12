package com.campusconnect.service;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.UpdateUserApprovalRequest;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AuthResponse.UserDto> listPendingCollegeAdmins() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == User.Role.COLLEGE_ADMIN || user.getRole() == User.Role.ADMIN)
                .filter(user -> user.getApprovalStatus() == User.ApprovalStatus.PENDING)
                .map(this::toUserDto)
                .toList();
    }

    @Transactional
    public AuthResponse.UserDto updateApproval(String userId, UpdateUserApprovalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != User.Role.COLLEGE_ADMIN && user.getRole() != User.Role.ADMIN) {
            throw new IllegalArgumentException("Only college admin accounts can be approved/rejected.");
        }

        user.setApprovalStatus(User.ApprovalStatus.valueOf(request.getStatus()));
        user.setApprovalNote(request.getNote() == null ? null : request.getNote().trim());
        return toUserDto(userRepository.save(user));
    }

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
}
