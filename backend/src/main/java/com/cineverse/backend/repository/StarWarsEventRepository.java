package com.cineverse.backend.repository;

import com.cineverse.backend.model.StarWarsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StarWarsEventRepository extends JpaRepository<StarWarsEvent, Integer> {
    List<StarWarsEvent> findByActive(Integer active);
}