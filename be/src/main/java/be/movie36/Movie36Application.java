package be.movie36;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Movie36Application {

	public static void main(String[] args) {
		SpringApplication.run(Movie36Application.class, args);
	}

}
