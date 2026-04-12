package be.movie36.entity;

import be.movie36.enums.Status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movie_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;
}
