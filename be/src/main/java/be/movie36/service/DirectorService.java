package be.movie36.service;

import be.movie36.dto.request.ActorRequest;
import be.movie36.dto.request.DirectorRequest;
import be.movie36.dto.response.ActorResponse;
import be.movie36.dto.response.DirectorResponse;
import be.movie36.entity.Actor;
import be.movie36.entity.Director;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.DirectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectorService {
    private final DirectorRepository directorRepository;

    // tao ra director
    public DirectorResponse create(DirectorRequest request) {
        if (directorRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.DIRECTOR_EXISTED);
        }
        return toResponse(directorRepository.save(
                Director.builder().name(request.getName())
                        .status(parseStatus(request.getStatus()))
                        .build()));
    }

    // lay danh sach actor
    public List<DirectorResponse> getAll() {
        return directorRepository.findAll().stream().map(this::toResponse).toList();
    }


    // tim kiem danh sach actor
    public List<DirectorResponse> search(String name) {
        return directorRepository.findByNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).toList();
    }

    // lat actor theo id
    public DirectorResponse getById(Long id) {
        return toResponse(findById(id));
    }
    // update

    public DirectorResponse update(Long id, DirectorRequest request) {
        Director director = findById(id);

        directorRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.ACTOR_EXISTED);
                    }
                });

        director.setName(request.getName());
        return toResponse(directorRepository.save(director));
    }

    // xoa
    public void delete(Long id) {
        Director director = findById(id);
        director.setStatus(Status.INACTIVE);
        directorRepository.delete(director);
    }

    // khoi phuc
    public void restore(Long id) {
        Director director = findById(id);
        director.setStatus(Status.ACTIVE);
        directorRepository.delete(director);
    }


    // helper
    public Director findById(Long id) {
        return directorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACTOR_NOT_FOUND));
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


    private DirectorResponse toResponse(Director director) {
        return DirectorResponse.builder()
                .id(director.getId())
                .name(director.getName())
                .status(director.getStatus().name())
                .build();
    }

}
