package com.cineverse.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StarWarsFilmDTO {
    private Integer id;
    private String title;
    private String description;
    private String characterName;
    private String eventDate;

    @JsonProperty("episode_id")
    private Integer episodeId;

    @JsonProperty("opening_crawl")
    private String openingCrawl;

    private String director;

    @JsonProperty("release_date")
    private String releaseDate;
}