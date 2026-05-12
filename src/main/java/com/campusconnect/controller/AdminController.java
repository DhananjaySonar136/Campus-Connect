package com.campusconnect.controller;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.UpdateUserApprovalRequest;
import com.campusconnect.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/pending-college-admins")
    public ResponseEntity<List<AuthResponse.UserDto>> listPendingCollegeAdmins() {
        return ResponseEntity.ok(adminService.listPendingCollegeAdmins());
    }

    @PatchMapping("/users/{userId}/approval")
    public ResponseEntity<AuthResponse.UserDto> updateUserApproval(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserApprovalRequest request
    ) {
        return ResponseEntity.ok(adminService.updateApproval(userId, request));
    }
}
