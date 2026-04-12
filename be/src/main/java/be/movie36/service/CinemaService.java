package be.movie36.service;

import be.movie36.dto.request.CinemaRequest;
import be.movie36.dto.response.CinemaResponse;
import be.movie36.entity.Cinema;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.CinemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CinemaService {
    private final CinemaRepository cinemaRepository;

    public CinemaResponse create(CinemaRequest request) {
        if (cinemaRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.CINEMA_EXISTED);
        }
        
        Cinema cinema = Cinema.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .description(request.getDescription())
                .status(parseStatus(request.getStatus()))
                .build();
                
        return toResponse(cinemaRepository.save(cinema));
    }

    public List<CinemaResponse> getAll() {
        return cinemaRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<CinemaResponse> getAllActive() {
        return cinemaRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    public CinemaResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public CinemaResponse update(Long id, CinemaRequest request) {
        Cinema cinema = findById(id);

        cinemaRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.CINEMA_EXISTED);
                    }
                });

        cinema.setName(request.getName());
        cinema.setAddress(request.getAddress());
        cinema.setPhone(request.getPhone());
        cinema.setEmail(request.getEmail());
        cinema.setDescription(request.getDescription());
        cinema.setStatus(parseStatus(request.getStatus()));

        return toResponse(cinemaRepository.save(cinema));
    }

    public void delete(Long id) {
        Cinema cinema = findById(id);
        cinema.setStatus(Status.INACTIVE);
        cinemaRepository.save(cinema);
    }
    
    public void restore(Long id) {
        Cinema cinema = findById(id);
        cinema.setStatus(Status.ACTIVE);
        cinemaRepository.save(cinema);
    }

    private Cinema findById(Long id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));
    }

    private Status parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return Status.ACTIVE;
        }
        try {
            return Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    private CinemaResponse toResponse(Cinema cinema) {
        return CinemaResponse.builder()
                .id(cinema.getId())
                .name(cinema.getName())
                .address(cinema.getAddress())
                .phone(cinema.getPhone())
                .email(cinema.getEmail())
                .description(cinema.getDescription())
                .status(cinema.getStatus().name())
                .build();
    }
}
