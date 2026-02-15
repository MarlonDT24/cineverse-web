package com.cineverse.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class StarWarsResponse {
    private int count;
    private List<StarWarsFilmDTO> results;
}
