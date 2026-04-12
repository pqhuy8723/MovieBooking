package be.movie36.service;


import be.movie36.dto.request.MovieTypeRequest;
import be.movie36.dto.response.MovieTypeResponse;
import be.movie36.entity.MovieType;
import be.movie36.repository.MovieTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieTypeService {
    private final MovieTypeRepository movieTypeRepository;

    // tao moi
    public MovieTypeResponse create(MovieTypeRequest request) {
        if (movieTypeRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.MOVIE_TYPE_EXISTED);
        }
        MovieType movieType = MovieType.builder()
                .name(request.getName())
                .status(parseStatus(request.getStatus()))
                .build();
        return toResponse(movieTypeRepository.save(movieType));
    }

    // lay tat
    public List<MovieTypeResponse> getAll() {
        return movieTypeRepository.findAll().stream().map(this::toResponse).toList();
    }

    // lay tat ca dang o trang thai active
    public List<MovieTypeResponse> getAllActive() {
        return movieTypeRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }


    // lay ra theo id
    public MovieTypeResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // cap nhat
    public MovieTypeResponse update(Long id, MovieTypeRequest request) {
        MovieType movieType = findById(id);

        // Kiểm tra tên mới có bị trùng với genre khác không
        movieTypeRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.MOVIE_TYPE_EXISTED);
                    }
                });

        movieType.setName(request.getName());
        movieType.setStatus(parseStatus(request.getStatus()));

        return toResponse(movieTypeRepository.save(movieType));
    }

    // xoa
    public void delete(Long id) {
        MovieType movieType = findById(id);
        movieType.setStatus(Status.INACTIVE);
        movieTypeRepository.save(movieType);
    }

    // khoi phuc
    public void restore(Long id) {
        MovieType movieType = findById(id);
        movieType.setStatus(Status.ACTIVE);
        movieTypeRepository.save(movieType);
    }


    // helper
    private MovieType findById(Long id) {
        return movieTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_TYPE_NOT_FOUND));
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

    private MovieTypeResponse toResponse(MovieType movieType) {
        return MovieTypeResponse.builder()
                .id(movieType.getId())
                .name(movieType.getName())
                .status(movieType.getStatus().name())
                .build();
    }
}
