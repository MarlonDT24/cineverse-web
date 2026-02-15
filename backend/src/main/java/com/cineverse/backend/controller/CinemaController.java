package com.cineverse.backend.controller;

import com.cineverse.backend.model.Cinema;
import com.cineverse.backend.repository.CinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinemas")
public class CinemaController {

    @Autowired
    private CinemaRepository cinemaRepository;

    @GetMapping
    public List<Cinema> getAllCinemas() {
        return cinemaRepository.findAll();
    }

    @PostMapping
    public Cinema createCinema(@RequestBody Cinema cinema) {
        return cinemaRepository.save(cinema);
    }

    @PutMapping("/{id}")
    public Cinema updateCinema(@PathVariable Integer id, @RequestBody Cinema cinema) {
        if (!cinemaRepository.existsById(id)) {
            throw new RuntimeException("Sala no encontrada con id: " + id);
        }
        cinema.setId(id);
        return cinemaRepository.save(cinema);
    }

    @DeleteMapping("/{id}")
    public void deleteCinema(@PathVariable Integer id) {
        if (!cinemaRepository.existsById(id)) {
            throw new RuntimeException("Sala no encontrada con id: " + id);
        }
        cinemaRepository.deleteById(id);
    }
}