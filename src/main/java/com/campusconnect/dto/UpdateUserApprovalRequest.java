package com.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserApprovalRequest {
    @NotBlank
    @Pattern(regexp = "^(APPROVED|REJECTED)$", message = "status must be APPROVED or REJECTED")
    private String status;

    @Size(max = 500)
    private String note;
}
