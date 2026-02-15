package com.cineverse.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConversationDTO {
    private Integer id;
    private Integer userId;
    private String userUsername;
    private Integer employeeId;
    private String employeeUsername;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
}
