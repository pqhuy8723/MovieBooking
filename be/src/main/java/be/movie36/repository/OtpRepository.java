package be.movie36.repository;

import be.movie36.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByOtpAndUsedFalse(String otp);

    void deleteByUserId(Long userId);
}
