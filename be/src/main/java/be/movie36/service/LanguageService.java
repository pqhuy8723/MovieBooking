package be.movie36.service;

import be.movie36.dto.request.LanguageRequest;
import be.movie36.dto.response.LanguageResponse;
import be.movie36.entity.Language;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.LanguageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LanguageService {
    private final LanguageRepository languageRepository;

    // tao moi
    public LanguageResponse create(LanguageRequest request) {
        if (languageRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.LANGUAGE_EXISTED);
        }
        Language language = Language.builder()
                .name(request.getName())
                .status(parseStatus(request.getStatus()))
                .build();
        return toResponse(languageRepository.save(language));
    }

    // lay ra tat ca
    public List<LanguageResponse> getAll() {
        return languageRepository.findAll().stream().map(this::toResponse).toList();
    }

    // lay tat ca dang o trang thai active
    public List<LanguageResponse> getAllActive() {
        return languageRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    // lay theo id
    public LanguageResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // cap nhat

    public LanguageResponse update(Long id, LanguageRequest request) {
        Language language = findById(id);

        // Kiểm tra tên mới có bị trùng với genre khác không
        languageRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.GENRE_EXISTED);
                    }
                });

        language.setName(request.getName());
        language.setStatus(parseStatus(request.getStatus()));

        return toResponse(languageRepository.save(language));
    }

    // xoa
    public void delete(Long id) {
        Language language = findById(id);
        language.setStatus(Status.INACTIVE);
        languageRepository.save(language);
    }

    // chuyen inactive sang active
    public  void restore(Long id){
        Language language = findById(id);
        language.setStatus(Status.ACTIVE);
        languageRepository.save(language);
    }

    // helper

    private Language findById(Long id) {
        return languageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LANGUAGE_NOT_FOUND));
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

    private LanguageResponse toResponse(Language language) {
        return LanguageResponse.builder()
                .id(language.getId())
                .name(language.getName())
                .status(language.getStatus().name())
                .build();
    }
}
