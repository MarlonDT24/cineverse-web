package com.cineverse.backend.service;

import com.cineverse.backend.dto.ChatMessageDTO;
import com.cineverse.backend.dto.ConversationDTO;
import com.cineverse.backend.model.ChatConversation;
import com.cineverse.backend.model.ChatMessage;
import com.cineverse.backend.model.User;
import com.cineverse.backend.repository.ChatConversationRepository;
import com.cineverse.backend.repository.ChatMessageRepository;
import com.cineverse.backend.repository.UserRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    // =====================================================================
    // REQUISITO ACADÉMICO: Pool de hilos para persistencia asíncrona
    // =====================================================================
    // Se utiliza un ExecutorService con un pool fijo de 4 hilos dedicados
    // exclusivamente al guardado en base de datos. Esto demuestra:
    //   1. Creación y gestión de ThreadPool (Executors.newFixedThreadPool)
    //   2. ThreadFactory personalizado con nombres descriptivos
    //   3. Ejecución asíncrona con CompletableFuture.runAsync
    //   4. ConcurrentHashMap para rastreo thread-safe de usuarios online
    //   5. Cierre ordenado del pool con @PreDestroy
    // =====================================================================

    private static final AtomicInteger threadCounter = new AtomicInteger(1);

    private final ExecutorService dbExecutor = Executors.newFixedThreadPool(4, r -> {
        Thread t = new Thread(r);
        t.setName("CineVerse-DB-Thread-" + threadCounter.getAndIncrement());
        t.setDaemon(true);
        return t;
    });

    // Mapa concurrente para rastrear usuarios conectados (demo de ConcurrentHashMap)
    private final ConcurrentHashMap<Integer, String> connectedUsers = new ConcurrentHashMap<>();

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatConversationRepository chatConversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ══════════════════════════════════════════════════════════════════════
    //  MÉTODO PRINCIPAL: Procesar y difundir mensaje
    // ══════════════════════════════════════════════════════════════════════
    //
    //  Flujo:
    //    Hilo WebSocket (principal) ──> Broadcast INMEDIATO al destinatario
    //                                └──> dbExecutor ──> Guardado en BD (asíncrono)
    //
    // ══════════════════════════════════════════════════════════════════════

    public ChatMessageDTO processAndBroadcast(ChatMessageDTO dto) {
        String currentThread = Thread.currentThread().getName();
        log.info("[HILO: {}] >> Mensaje recibido de userId={} en conversación={}",
                currentThread, dto.getSenderId(), dto.getConversationId());

        dto.setSentAt(LocalDateTime.now());

        // Resolver username del sender si no viene en el DTO
        if (dto.getSenderUsername() == null) {
            userRepository.findById(dto.getSenderId())
                    .ifPresent(u -> dto.setSenderUsername(u.getUsername()));
        }

        // ── PASO 1: BROADCAST INMEDIATO (hilo del WebSocket) ──────────────
        log.info("[HILO: {}] >> Enviando broadcast INMEDIATO a /topic/conversation/{}",
                currentThread, dto.getConversationId());

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + dto.getConversationId(), dto);

        // ── PASO 2: GUARDADO ASÍNCRONO (hilo separado del pool) ───────────
        CompletableFuture.runAsync(() -> {
            String dbThread = Thread.currentThread().getName();
            log.info("[HILO: {}] >> Iniciando guardado en BD para conversación={} (asíncrono)",
                    dbThread, dto.getConversationId());

            try {
                ChatMessage entity = new ChatMessage();

                ChatConversation conversation = chatConversationRepository
                        .findById(dto.getConversationId())
                        .orElseThrow(() -> new RuntimeException(
                                "Conversación no encontrada: " + dto.getConversationId()));
                entity.setConversation(conversation);

                User sender = userRepository.findById(dto.getSenderId())
                        .orElseThrow(() -> new RuntimeException(
                                "Usuario no encontrado: " + dto.getSenderId()));
                entity.setSender(sender);

                entity.setMessage(dto.getMessage());
                entity.setMessageType(
                        ChatMessage.MessageType.valueOf(
                                dto.getMessageType() != null ? dto.getMessageType() : "TEXT"));
                entity.setSentAt(dto.getSentAt());

                ChatMessage saved = chatMessageRepository.save(entity);
                log.info("[HILO: {}] >> Mensaje guardado exitosamente con id={}",
                        dbThread, saved.getId());

            } catch (Exception e) {
                log.error("[HILO: {}] >> ERROR al guardar mensaje en BD: {}",
                        dbThread, e.getMessage(), e);
            }
        }, dbExecutor);

        return dto;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  Gestión de conversaciones (REST)
    // ══════════════════════════════════════════════════════════════════════

    public ConversationDTO createConversation(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userId));

        ChatConversation conversation = new ChatConversation();
        conversation.setUser(user);
        conversation.setStatus(ChatConversation.ConversationStatus.OPEN);
        conversation.setCreatedAt(LocalDateTime.now());

        ChatConversation saved = chatConversationRepository.save(conversation);
        return toConversationDTO(saved);
    }

    public ConversationDTO assignEmployee(Integer conversationId, Integer employeeId) {
        ChatConversation conversation = chatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Conversación no encontrada: " + conversationId));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado: " + employeeId));

        conversation.setEmployee(employee);
        conversation.setStatus(ChatConversation.ConversationStatus.OPEN);
        ChatConversation saved = chatConversationRepository.save(conversation);

        // Notificar via WebSocket que un empleado se unió
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                (Object) Map.of("type", "EMPLOYEE_JOINED",
                        "employeeUsername", employee.getUsername()));

        return toConversationDTO(saved);
    }

    public List<ConversationDTO> getConversations(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + userId));

        List<ChatConversation> conversations;

        switch (user.getRole()) {
            case ADMIN:
                // God Mode: ver TODAS las conversaciones del sistema
                conversations = chatConversationRepository.findAllByOrderByCreatedAtDesc();
                break;
            case EMPLOYEE:
                // Asignadas a mí + huérfanas (employee IS NULL) para reclamar
                conversations = chatConversationRepository.findByEmployeeIdOrUnassigned(userId);
                break;
            default:
                // Cliente: solo sus propias conversaciones
                conversations = chatConversationRepository.findByUserIdOrderByCreatedAtDesc(userId);
                break;
        }

        return conversations.stream()
                .map(this::toConversationDTO)
                .collect(Collectors.toList());
    }

    public List<ConversationDTO> getWaitingConversations() {
        return chatConversationRepository
                .findByStatusOrderByCreatedAtAsc(ChatConversation.ConversationStatus.WAITING)
                .stream()
                .map(this::toConversationDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getMessages(Integer conversationId) {
        return chatMessageRepository
                .findByConversationIdOrderBySentAtAsc(conversationId)
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    public ConversationDTO closeConversation(Integer conversationId) {
        ChatConversation conversation = chatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException(
                        "Conversación no encontrada: " + conversationId));

        conversation.setStatus(ChatConversation.ConversationStatus.CLOSED);
        conversation.setClosedAt(LocalDateTime.now());
        ChatConversation saved = chatConversationRepository.save(conversation);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                (Object) Map.of("type", "CONVERSATION_CLOSED"));

        return toConversationDTO(saved);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  Tracking de usuarios conectados (ConcurrentHashMap - thread-safe)
    // ══════════════════════════════════════════════════════════════════════

    public void userConnected(Integer userId, String sessionId) {
        connectedUsers.put(userId, sessionId);
        log.info("[CONCURRENCIA] Usuario {} conectado. Total online: {}",
                userId, connectedUsers.size());
    }

    public void userDisconnected(Integer userId) {
        connectedUsers.remove(userId);
        log.info("[CONCURRENCIA] Usuario {} desconectado. Total online: {}",
                userId, connectedUsers.size());
    }

    public Map<Integer, String> getConnectedUsers() {
        return Map.copyOf(connectedUsers);
    }

    // ══════════════════════════════════════════════════════════════════════
    //  Mappers Entity -> DTO
    // ══════════════════════════════════════════════════════════════════════

    private ConversationDTO toConversationDTO(ChatConversation c) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(c.getId());
        dto.setUserId(c.getUser().getId());
        dto.setUserUsername(c.getUser().getUsername());
        if (c.getEmployee() != null) {
            dto.setEmployeeId(c.getEmployee().getId());
            dto.setEmployeeUsername(c.getEmployee().getUsername());
        }
        dto.setStatus(c.getStatus().name());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setClosedAt(c.getClosedAt());
        return dto;
    }

    private ChatMessageDTO toMessageDTO(ChatMessage m) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(m.getId());
        dto.setConversationId(m.getConversation().getId());
        dto.setSenderId(m.getSender().getId());
        dto.setSenderUsername(m.getSender().getUsername());
        dto.setMessage(m.getMessage());
        dto.setMessageType(m.getMessageType().name());
        dto.setSentAt(m.getSentAt());
        return dto;
    }

    // ══════════════════════════════════════════════════════════════════════
    //  Cierre ordenado del pool de hilos (@PreDestroy)
    // ══════════════════════════════════════════════════════════════════════

    @PreDestroy
    public void shutdown() {
        log.info("[CONCURRENCIA] Iniciando cierre del pool de hilos de persistencia...");
        dbExecutor.shutdown();
        try {
            if (!dbExecutor.awaitTermination(10, TimeUnit.SECONDS)) {
                log.warn("[CONCURRENCIA] Timeout alcanzado. Forzando cierre del pool...");
                dbExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            dbExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        log.info("[CONCURRENCIA] Pool de hilos cerrado correctamente.");
    }
}
