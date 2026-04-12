package be.movie36.controller;

import be.movie36.constant.Message;
import be.movie36.dto.request.TicketPricingRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.TicketPricingResponse;
import be.movie36.service.TicketPricingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket-pricings")
@RequiredArgsConstructor
public class TicketPricingController {
    private final TicketPricingService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketPricingResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_PRICING_SUCCESS, service.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TicketPricingResponse>>> getAllActive() {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_PRICING_SUCCESS, service.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketPricingResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.GET_PRICING_BYID, service.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketPricingResponse>> create(
            @Valid @RequestBody TicketPricingRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.CREATE_PRICING_SUCCESS, service.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketPricingResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TicketPricingRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(Message.UPDATE_PRICING_SUCCESS, service.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Message.DELETE_PRICING_SUCCESS));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.restore(id);
        return ResponseEntity.ok(ApiResponse.success(Message.RESTORE_SUCCESS));
    }
}
