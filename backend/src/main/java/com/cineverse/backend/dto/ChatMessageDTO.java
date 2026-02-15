package com.cineverse.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
    private Integer id;
    private Integer conversationId;
    private Integer senderId;
    private String senderUsername;
    private String message;
    private String messageType;
    private LocalDateTime sentAt;
}
