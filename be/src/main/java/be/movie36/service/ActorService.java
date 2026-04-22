package be.movie36.service;

import be.movie36.dto.request.ActorRequest;
import be.movie36.dto.response.ActorResponse;
import be.movie36.entity.Actor;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.ActorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActorService {
    private final ActorRepository actorRepository;

    // tao actor
    public ActorResponse create(ActorRequest request) {
        if (actorRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.ACTOR_EXISTED);
        }
        return toResponse(actorRepository.save(
                Actor.builder()
                        .name(request.getName())
                        .status(parseStatus(request.getStatus()))
                        .build()));
    }

    // lay danh sach actor
    public Page<ActorResponse> getAll(String name, Pageable pageable) {
        Specification<Actor> spec = (root, query, criteriaBuilder) -> {
            if (name == null || name.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
        return actorRepository.findAll(spec, pageable).map(this::toResponse);
    }

    // lay tat ca actor dang active (dung cho dropdown)
    public List<ActorResponse> getAllActive() {
        return actorRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    // tim kiem danh sach actor
    public List<ActorResponse> search(String name) {
        return actorRepository.findByNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).toList();
    }

    // lat actor theo id
    public ActorResponse getById(Long id) {
        return toResponse(findById(id));
    }
    // update

    public ActorResponse update(Long id, ActorRequest request) {
        Actor actor = findById(id);

        actorRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.ACTOR_EXISTED);
                    }
                });

        actor.setName(request.getName());
        return toResponse(actorRepository.save(actor));
    }

    // xoa
    public void delete(Long id) {
        Actor actor = findById(id);
        actor.setStatus(Status.INACTIVE);
        actorRepository.save(actor);
    }

    // khoi phuc
    public void restore(Long id) {
        Actor actor = findById(id);
        actor.setStatus(Status.ACTIVE);
        actorRepository.save(actor);
    }


    // helper
    public Actor findById(Long id) {
        return actorRepository.findById(id)
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

    private ActorResponse toResponse(Actor actor) {
        return ActorResponse.builder()
                .id(actor.getId())
                .name(actor.getName())
                .status(actor.getStatus().name())
                .build();
    }

}
