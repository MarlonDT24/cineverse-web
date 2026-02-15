package com.cineverse.backend.controller;

import com.cineverse.backend.dto.StarWarsFilmDTO;
import com.cineverse.backend.service.StarWarsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/marketing")
public class StarWarsController {

    @Autowired
    private StarWarsService starWarsService;

    @GetMapping("/starwars")
    public List<StarWarsFilmDTO> getStarWarsEvents() {
        return starWarsService.getStarWarsMovies();
    }
}