package be.movie36.service;

import be.movie36.dto.request.SeatGenerateRequest;
import be.movie36.dto.request.SeatRequest;
import be.movie36.dto.response.SeatResponse;
import be.movie36.entity.Screen;
import be.movie36.entity.Seat;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.ScreenRepository;
import be.movie36.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final ScreenRepository screenRepository;

    public SeatResponse create(SeatRequest request) {
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));

        if (seatRepository.countByScreenId(screen.getId()) >= screen.getSeatingCapacity()) {
            throw new AppException(ErrorCode.SEAT_CAPACITY_EXCEEDED);
        }

        if (seatRepository.findByScreenIdAndName(screen.getId(), request.getName()).isPresent()) {
            throw new AppException(ErrorCode.SEAT_EXISTED);
        }

        Seat seat = Seat.builder()
                .name(request.getName())
                .type(request.getType() != null ? request.getType() : "STANDARD")
                .status(parseStatus(request.getStatus()))
                .screen(screen)
                .build();

        return toResponse(seatRepository.save(seat));
    }

    @Transactional
    public List<SeatResponse> generateSeats(SeatGenerateRequest request) {
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));

        int totalSeatsToGenerate = request.getRowCount() * request.getColumnCount();
        if (totalSeatsToGenerate > screen.getSeatingCapacity()) {
            throw new AppException(ErrorCode.SEAT_CAPACITY_EXCEEDED);
        }

        if (seatRepository.existsByScreenId(screen.getId())) {
            throw new AppException(ErrorCode.SEAT_EXISTED);
        }

        List<Seat> seatsToSave = new ArrayList<>();
        String defaultType = request.getDefaultType() != null ? request.getDefaultType() : "STANDARD";

        for (int r = 0; r < request.getRowCount(); r++) {
            char rowLetter = (char) ('A' + r);
            for (int c = 1; c <= request.getColumnCount(); c++) {
                String seatName = rowLetter + String.valueOf(c);
                Seat seat = Seat.builder()
                        .name(seatName)
                        .type(defaultType)
                        .status(Status.ACTIVE)
                        .screen(screen)
                        .build();
                seatsToSave.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToSave);
        return savedSeats.stream().map(this::toResponse).toList();
    }

    public List<SeatResponse> getAllByScreenId(Long screenId) {
        if (!screenRepository.existsById(screenId)) {
            throw new AppException(ErrorCode.SCREEN_NOT_FOUND);
        }
        return seatRepository.findByScreenId(screenId).stream().map(this::toResponse).toList();
    }

    public Page<SeatResponse> getAllByScreenId(Long screenId, Pageable pageable) {
        if (!screenRepository.existsById(screenId)) {
            throw new AppException(ErrorCode.SCREEN_NOT_FOUND);
        }
        return seatRepository.findByScreenId(screenId, pageable).map(this::toResponse);
    }

    public SeatResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public SeatResponse update(Long id, SeatRequest request) {
        Seat seat = findById(id);

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new AppException(ErrorCode.SCREEN_NOT_FOUND));

        seatRepository.findByScreenIdAndName(screen.getId(), request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.SEAT_EXISTED);
                    }
                });

        seat.setName(request.getName());
        seat.setType(request.getType());
        seat.setStatus(parseStatus(request.getStatus()));
        seat.setScreen(screen);

        return toResponse(seatRepository.save(seat));
    }

    public void delete(Long id) {
        Seat seat = findById(id);
        seat.setStatus(Status.INACTIVE);
        seatRepository.save(seat);
    }

    public void restore(Long id) {
        Seat seat = findById(id);
        seat.setStatus(Status.ACTIVE);
        seatRepository.save(seat);
    }

    private Seat findById(Long id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SEAT_NOT_FOUND));
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

    private SeatResponse toResponse(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .name(seat.getName())
                .type(seat.getType())
                .status(seat.getStatus().name())
                .screenId(seat.getScreen().getId())
                .build();
    }
}
