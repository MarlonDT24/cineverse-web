package com.cineverse.backend.controller;

import com.cineverse.backend.model.Session;
import com.cineverse.backend.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionRepository sessionRepository;

    @GetMapping
    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    @PostMapping
    public Session createSession(@RequestBody Session session) {
        return sessionRepository.save(session);
    }

    @PutMapping("/{id}")
    public Session updateSession(@PathVariable Integer id, @RequestBody Session session) {
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("Sesión no encontrada con id: " + id);
        }
        session.setId(id);
        return sessionRepository.save(session);
    }

    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Integer id) {
        if (!sessionRepository.existsById(id)) {
            throw new RuntimeException("Sesión no encontrada con id: " + id);
        }
        sessionRepository.deleteById(id);
    }
}