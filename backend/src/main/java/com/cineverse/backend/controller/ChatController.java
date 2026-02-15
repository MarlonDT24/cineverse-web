package com.cineverse.backend.controller;

import com.cineverse.backend.dto.ChatMessageDTO;
import com.cineverse.backend.dto.ConversationDTO;
import com.cineverse.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    // ══════════════════════════════════════════════════════════════════════
    //  STOMP WebSocket Endpoint
    //  El cliente envía a: /app/chat.send
    //  El servidor broadcast a: /topic/conversation/{id}
    // ══════════════════════════════════════════════════════════════════════

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageDTO message) {
        chatService.processAndBroadcast(message);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  REST Endpoints para gestión de conversaciones
    // ══════════════════════════════════════════════════════════════════════

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDTO> createConversation(
            @RequestBody Map<String, Integer> body) {
        Integer userId = body.get("userId");
        return ResponseEntity.ok(chatService.createConversation(userId));
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    @GetMapping("/conversations/waiting")
    public ResponseEntity<List<ConversationDTO>> getWaitingConversations() {
        return ResponseEntity.ok(chatService.getWaitingConversations());
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Integer conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PutMapping("/conversations/{conversationId}/assign")
    public ResponseEntity<ConversationDTO> assignEmployee(
            @PathVariable Integer conversationId,
            @RequestBody Map<String, Integer> body) {
        Integer employeeId = body.get("employeeId");
        return ResponseEntity.ok(chatService.assignEmployee(conversationId, employeeId));
    }

    @PutMapping("/conversations/{conversationId}/close")
    public ResponseEntity<ConversationDTO> closeConversation(
            @PathVariable Integer conversationId) {
        return ResponseEntity.ok(chatService.closeConversation(conversationId));
    }

    @GetMapping("/online-users")
    public ResponseEntity<Map<Integer, String>> getOnlineUsers() {
        return ResponseEntity.ok(chatService.getConnectedUsers());
    }
}
