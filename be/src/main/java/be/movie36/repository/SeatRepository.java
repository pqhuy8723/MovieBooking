package be.movie36.repository;

import be.movie36.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreenId(Long screenId);

    Page<Seat> findByScreenId(Long screenId, Pageable pageable);

    Optional<Seat> findByScreenIdAndName(Long screenId, String name);

    boolean existsByScreenId(Long screenId);

    long countByScreenId(Long screenId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Seat s WHERE s.id IN :ids ORDER BY s.id")
    List<Seat> findByIdsWithLock(@Param("ids") List<Long> ids);
}
