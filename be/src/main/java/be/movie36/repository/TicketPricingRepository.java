package be.movie36.repository;

import be.movie36.entity.TicketPricing;
import be.movie36.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketPricingRepository extends JpaRepository<TicketPricing, Long> {
    Optional<TicketPricing> findByType(String type);
    List<TicketPricing> findByStatus(Status status);
}
