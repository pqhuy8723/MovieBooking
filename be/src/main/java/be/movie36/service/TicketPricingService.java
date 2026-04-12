package be.movie36.service;

import be.movie36.dto.request.TicketPricingRequest;
import be.movie36.dto.response.TicketPricingResponse;
import be.movie36.entity.TicketPricing;
import be.movie36.enums.Status;
import be.movie36.exception.AppException;
import be.movie36.exception.ErrorCode;
import be.movie36.repository.TicketPricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketPricingService {
    private final TicketPricingRepository ticketPricingRepository;

    public TicketPricingResponse create(TicketPricingRequest request) {
        if (ticketPricingRepository.findByType(request.getType()).isPresent()) {
            throw new AppException(ErrorCode.PRICING_EXISTED);
        }

        TicketPricing pricing = TicketPricing.builder()
                .type(request.getType())
                .price(request.getPrice())
                .ageGroup(request.getAgeGroup())
                .rules(request.getRules())
                .status(parseStatus(request.getStatus()))
                .build();

        return toResponse(ticketPricingRepository.save(pricing));
    }

    public List<TicketPricingResponse> getAll() {
        return ticketPricingRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<TicketPricingResponse> getAllActive() {
        return ticketPricingRepository.findByStatus(Status.ACTIVE).stream().map(this::toResponse).toList();
    }

    public TicketPricingResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public TicketPricingResponse update(Long id, TicketPricingRequest request) {
        TicketPricing pricing = findById(id);

        ticketPricingRepository.findByType(request.getType())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException(ErrorCode.PRICING_EXISTED);
                    }
                });

        pricing.setType(request.getType());
        pricing.setPrice(request.getPrice());
        pricing.setAgeGroup(request.getAgeGroup());
        pricing.setRules(request.getRules());
        pricing.setStatus(parseStatus(request.getStatus()));

        return toResponse(ticketPricingRepository.save(pricing));
    }

    public void delete(Long id) {
        TicketPricing pricing = findById(id);
        pricing.setStatus(Status.INACTIVE);
        ticketPricingRepository.save(pricing);
    }

    public void restore(Long id) {
        TicketPricing pricing = findById(id);
        pricing.setStatus(Status.ACTIVE);
        ticketPricingRepository.save(pricing);
    }

    private TicketPricing findById(Long id) {
        return ticketPricingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRICING_NOT_FOUND));
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

    private TicketPricingResponse toResponse(TicketPricing pricing) {
        return TicketPricingResponse.builder()
                .id(pricing.getId())
                .type(pricing.getType())
                .price(pricing.getPrice())
                .ageGroup(pricing.getAgeGroup())
                .rules(pricing.getRules())
                .status(pricing.getStatus().name())
                .build();
    }
}
