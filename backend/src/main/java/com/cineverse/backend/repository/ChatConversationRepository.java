package com.cineverse.backend.repository;

import com.cineverse.backend.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Integer> {

    // Cliente: solo sus propias conversaciones
    List<ChatConversation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Admin "God Mode": TODAS las conversaciones del sistema
    List<ChatConversation> findAllByOrderByCreatedAtDesc();

    // Empleado: las que tiene asignadas + las huérfanas (sin empleado asignado)
    @Query("SELECT c FROM ChatConversation c WHERE c.employee.id = :employeeId OR c.employee IS NULL ORDER BY c.createdAt DESC")
    List<ChatConversation> findByEmployeeIdOrUnassigned(@Param("employeeId") Integer employeeId);

    List<ChatConversation> findByStatusOrderByCreatedAtAsc(ChatConversation.ConversationStatus status);
}
