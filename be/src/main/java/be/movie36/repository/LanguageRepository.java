package be.movie36.repository;

import be.movie36.entity.Language;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LanguageRepository extends JpaRepository<Language, Long>, JpaSpecificationExecutor<Language> {
    Optional<Language> findByName(String name);

    List<Language> findByStatus(Status status);
}
