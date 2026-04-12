package be.movie36.repository;

import be.movie36.entity.Director;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface  DirectorRepository extends JpaRepository<Director, Long> {
    Optional<Director> findByName(String name);
    List<Director> findByNameContainingIgnoreCase(String name);

    List<Director> findByStatus(Status status);
}
