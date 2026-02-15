package com.cineverse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "star_wars_events")
public class StarWarsEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "swapi_id")
    private Integer swapiId;

    private String title;
    private String description;

    @Column(name = "character_name")
    private String characterName;

    @Column(name = "event_date")
    private String eventDate;

    private Integer active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}