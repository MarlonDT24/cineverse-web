package com.cineverse.backend.service;

import com.cineverse.backend.model.Movie;
import com.cineverse.backend.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie saveMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Integer id, Movie movie) {
        if (!movieRepository.existsById(id)) {
            throw new RuntimeException("Película no encontrada con id: " + id);
        }
        movie.setId(id);
        return movieRepository.save(movie);
    }

    public void deleteMovie(Integer id) {
        if (!movieRepository.existsById(id)) {
            throw new RuntimeException("Película no encontrada con id: " + id);
        }
        movieRepository.deleteById(id);
    }
}