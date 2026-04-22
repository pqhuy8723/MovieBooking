package be.movie36.controller;

import be.movie36.dto.request.MovieRequest;
import be.movie36.dto.response.ApiResponse;
import be.movie36.dto.response.MovieResponse;
import be.movie36.dto.response.MovieSummaryResponse;
import be.movie36.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {
        private final MovieService movieService;

        // GET /api/movies — lấy tất cả (ADMIN)
        @GetMapping
        public ResponseEntity<ApiResponse<List<MovieResponse>>> getAll() {
                return ResponseEntity.ok(
                                ApiResponse.success("Lấy danh sách phim thành công", movieService.getAll()));
        }

        // GET /api/movies/active — lấy phim đang active (PUBLIC)
        @GetMapping("/active")
        public ResponseEntity<ApiResponse<List<MovieSummaryResponse>>> getAllActive() {
                return ResponseEntity.ok(
                        ApiResponse.success("Lấy danh sách phim thành công",
                                movieService.getAllActive()));
        }

        // GET /api/movies/{id} — lấy chi tiết phim (PUBLIC)
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<MovieResponse>> getById(@PathVariable Long id) {
                return ResponseEntity.ok(
                                ApiResponse.success("Lấy thông tin phim thành công", movieService.getById(id)));
        }

        // GET /api/movies/search?title=xxx — tìm kiếm theo tên (PUBLIC)
        @GetMapping("/search")
        public ResponseEntity<ApiResponse<List<MovieResponse>>> search(@RequestParam String title) {
                return ResponseEntity.ok(
                                ApiResponse.success("Tìm kiếm phim thành công", movieService.search(title)));
        }

        // GET /api/movies/genre/{genreId} — lọc theo thể loại (PUBLIC)
        @GetMapping("/genre/{genreId}")
        public ResponseEntity<ApiResponse<List<MovieResponse>>> getByGenre(
                        @PathVariable Long genreId) {
                return ResponseEntity.ok(
                                ApiResponse.success("Lấy danh sách phim theo thể loại thành công",
                                                movieService.getByGenre(genreId)));
        }

        // GET /api/movies/type/{movieTypeId} — lọc theo loại phim (PUBLIC)
        @GetMapping("/type/{movieTypeId}")
        public ResponseEntity<ApiResponse<List<MovieResponse>>> getByMovieType(
                        @PathVariable Long movieTypeId) {
                return ResponseEntity.ok(
                                ApiResponse.success("Lấy danh sách phim theo loại thành công",
                                                movieService.getByMovieType(movieTypeId)));
        }

        // POST /api/movies — tạo phim mới (ADMIN)
        @PostMapping
        public ResponseEntity<ApiResponse<MovieResponse>> create(
                        @Valid @RequestBody MovieRequest request) {
                return ResponseEntity.ok(
                                ApiResponse.success("Tạo phim thành công", movieService.create(request)));
        }

        // PUT /api/movies/{id} — cập nhật phim (ADMIN)
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<MovieResponse>> update(
                        @PathVariable Long id,
                        @Valid @RequestBody MovieRequest request) {
                return ResponseEntity.ok(
                                ApiResponse.success("Cập nhật phim thành công", movieService.update(id, request)));
        }

        // DELETE /api/movies/{id} — xóa phim (ADMIN)
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
                movieService.delete(id);
                return ResponseEntity.ok(ApiResponse.success("Xóa phim thành công"));
        }
}
