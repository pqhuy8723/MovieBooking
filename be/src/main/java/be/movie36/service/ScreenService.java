package be.movie36.service;

import be.movie36.dto.request.ScreenRequest;
import be.movie36.dto.response.ScreenResponse;
import be.movie36.entity.Cinema;
import be.movie36.entity.Screen;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.CinemaRepository;
import be.movie36.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreenService {
    private final ScreenRepository screenRepository;
    private final CinemaRepository cinemaRepository;

    public ScreenResponse create(ScreenRequest request) {
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        if (screenRepository.findByCinemaIdAndName(cinema.getId(), request.getName()).isPresent()) {
            throw new AppException(ErrorCode.SCREEN_EXISTED);
        }

        Screen screen = Screen.builder()
                .name(request.getName())
                .seatingCapacity(request.getSeatingCapacity())
                .type(request.getType())
                .status(parseStatus(request.getStatus()))
                .cinema(cinema)
                .build();

        return toResponse(screenRepository.save(screen));
    }

    public List<ScreenResponse> getAllByCinemaId(Long cinemaId) {
        if (!cinemaRepository.existsById(cinemaId)) {
            throw new AppException(ErrorCode.CINEMA_NOT_FOUND);
        }
        return screenRepository.findByCinemaId(cinemaId).stream().map(this::toResponse).toList();
    }

    public ScreenResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public ScreenResponse update(Long id, ScreenRequest request) {
        Screen screen = findById(id);
        
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new AppException(ErrorCode.CINEMA_NOT_FOUND));

        screenRepository.findByCinemaIdAndName(cinema.getId(), request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.SCREEN_EXISTED);
                    }
                });

        screen.setName(request.getName());
        screen.setSeatingCapacity(request.getSeatingCapacity());
        screen.setType(request.getType());
        screen.setStatus(parseStatus(request.getStatus()));
        screen.setCinema(cinema);

        return toResponse(screenRepository.save(screen));
    }

    public void delete(Long id) {
        Screen screen = findById(id);
        screen.setStatus(Status.INACTIVE);
        screenRepository.save(screen);
    }
    
    public void restore(Long id) {
        Screen screen = findById(id);
        screen.setStatus(Status.ACTIVE);
        screenRepository.save(screen);
    }

    private Screen findById(Long id) {
        return screenRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));
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

    private ScreenResponse toResponse(Screen screen) {
        return ScreenResponse.builder()
                .id(screen.getId())
                .name(screen.getName())
                .seatingCapacity(screen.getSeatingCapacity())
                .type(screen.getType())
                .status(screen.getStatus().name())
                .cinema(ScreenResponse.SimpleCinemaResponse.builder()
                        .id(screen.getCinema().getId())
                        .name(screen.getCinema().getName())
                        .build())
                .build();
    }
}
