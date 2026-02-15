package com.cineverse.backend.service;

import com.cineverse.backend.dto.StarWarsFilmDTO;
import com.cineverse.backend.dto.StarWarsResponse;
import com.cineverse.backend.model.StarWarsEvent;
import com.cineverse.backend.repository.StarWarsEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StarWarsService {

    @Autowired
    private StarWarsEventRepository starWarsEventRepository;

    private final String SWAPI_URL = "https://swapi.dev/api/films/";

    public List<StarWarsFilmDTO> getStarWarsMovies() {
        RestTemplate restTemplate = new RestTemplate();

        // 1. REQUISITO: Conectar a la API externa (Personajes de Star Wars)
        String importedName = "Personaje Misterioso";
        try {
            int randomId = (int) (Math.random() * 10) + 1;
            Map<String, Object> swapiPerson = restTemplate.getForObject(SWAPI_URL + randomId + "/", Map.class);
            if (swapiPerson != null && swapiPerson.containsKey("name")) {
                importedName = (String) swapiPerson.get("name");
            }
        } catch (Exception e) {
            System.err.println("Error consultando SWAPI: " + e.getMessage());
        }

        // 2. REQUISITO: Consultar eventos locales
        List<StarWarsEvent> localEvents = starWarsEventRepository.findByActive(1);
        final String finalImportedName = importedName;

        // 3. REQUISITO: "Importar" y mostrar
        return localEvents.stream().map(event -> {
            StarWarsFilmDTO dto = new StarWarsFilmDTO();
            dto.setId(event.getId());
            dto.setTitle(event.getTitle());
            dto.setDescription(event.getDescription());
            dto.setEventDate(event.getEventDate());

            // Lógica de importación: Si en BD no hay nombre, usamos el de la API externa
            if (event.getCharacterName() == null || event.getCharacterName().isEmpty()) {
                dto.setCharacterName(finalImportedName + " (SWAPI)");
            } else {
                dto.setCharacterName(event.getCharacterName());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    private StarWarsFilmDTO toDTO(StarWarsEvent event) {
        StarWarsFilmDTO dto = new StarWarsFilmDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        if (event.getCharacterName() == null) {
            dto.setCharacterName("Dato de SWAPI");
        } else {
            dto.setCharacterName(event.getCharacterName());
        }

        dto.setEventDate(event.getEventDate());
        return dto;
    }
}