package be.movie36.service;

import be.movie36.dto.request.GenreRequest;
import be.movie36.dto.response.GenreResponse;
import be.movie36.entity.Genre;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GenreService {
    private final GenreRepository genreRepository;

    // tao moi
    public GenreResponse create(GenreRequest request) {
        if (genreRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.GENRE_EXISTED);
        }

        Genre genre = Genre.builder()
                .name(request.getName())
                .status(parseStatus(request.getStatus()))
                .build();
        return toResponse(genreRepository.save(genre));
    }

    // lay ra tat ca

    public List<GenreResponse> getAll() {
        return genreRepository.findAll().stream().map(this::toResponse).toList();
    }

    // lay tat ca dang o trang thai active
    public List<GenreResponse> getAllActive() {
        return genreRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    // lay ra theo id
    public GenreResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // cap nhat
    public GenreResponse update(Long id, GenreRequest request) {
        Genre genre = findById(id);

        // Kiểm tra tên mới có bị trùng với genre khác không
        genreRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.GENRE_EXISTED);
                    }
                });

        genre.setName(request.getName());
        genre.setStatus(parseStatus(request.getStatus()));

        return toResponse(genreRepository.save(genre));
    }

    // xoa chuyen active trang inactive
    public void delete(Long id) {
        Genre genre = findById(id);
        genre.setStatus(Status.INACTIVE);
        genreRepository.save(genre);
    }

    // chuyen inactive sang active
    public  void restore(Long id){
        Genre genre = findById(id);
        genre.setStatus(Status.ACTIVE);
        genreRepository.save(genre);
    }

    // helper

    private Genre findById(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));
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

    private GenreResponse toResponse(Genre genre) {
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .status(genre.getStatus().name())
                .build();
    }

}
