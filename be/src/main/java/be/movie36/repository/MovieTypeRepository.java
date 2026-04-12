package be.movie36.repository;

import be.movie36.entity.Language;
import be.movie36.entity.MovieType;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieTypeRepository extends JpaRepository<MovieType, Long> {
    Optional<MovieType> findByName(String name);

    List<MovieType> findByStatus(Status status);
}
