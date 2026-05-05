package com.campusconnect;

import com.campusconnect.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_withValidData_returns201AndToken() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Jane Smith");
        req.setEmail("jane.test@university.edu");
        req.setUniversity("MIT");
        req.setPassword("SecurePass1");
        req.setConfirmPassword("SecurePass1");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("jane.test@university.edu"));
    }

    @Test
    void register_withMissingName_returns422() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("");
        req.setEmail("test@university.edu");
        req.setUniversity("MIT");
        req.setPassword("SecurePass1");
        req.setConfirmPassword("SecurePass1");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_withPasswordMismatch_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Jane Smith");
        req.setEmail("jane2@university.edu");
        req.setUniversity("MIT");
        req.setPassword("SecurePass1");
        req.setConfirmPassword("DifferentPass1");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_duplicateEmail_returns409() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Jane Smith");
        req.setEmail("duplicate@university.edu");
        req.setUniversity("MIT");
        req.setPassword("SecurePass1");
        req.setConfirmPassword("SecurePass1");

        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Duplicate
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }
}
