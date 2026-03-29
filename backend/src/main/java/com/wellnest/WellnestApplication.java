package com.wellnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WellnestApplication {

  public static void main(String[] args) {
    SpringApplication.run(WellnestApplication.class, args);
  }
}
