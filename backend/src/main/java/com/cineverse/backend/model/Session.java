package com.cineverse.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Relación con Película
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    // Relación con Sala
    @ManyToOne
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(name = "session_datetime", nullable = false)
    private LocalDateTime sessionDatetime;

    @Column(name = "price_normal", nullable = false)
    private BigDecimal priceNormal;

    @Column(name = "price_vip", nullable = false)
    private BigDecimal priceVip;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    private Boolean active = true;
}