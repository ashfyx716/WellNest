package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.ChatRequest;
import com.wellnest.dto.WellnessDtos.ChatResponse;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.NestiService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nesti")
public class NestiController {

  private final NestiService nestiService;
  private final AuthFacade authFacade;

  public NestiController(NestiService nestiService, AuthFacade authFacade) {
    this.nestiService = nestiService;
    this.authFacade = authFacade;
  }

  @PostMapping("/chat")
  public ChatResponse chat(@Valid @RequestBody ChatRequest req) {
    return nestiService.chat(authFacade.requireUser(), req);
  }

  @GetMapping("/history")
  public List<?> history() {
    return nestiService.history(authFacade.requireUser());
  }

  @DeleteMapping("/clear")
  public Map<String, String> clear() {
    nestiService.clearChat(authFacade.requireUser());
    return Map.of("message", "Chat cleared");
  }

  @GetMapping("/greeting")
  public Map<String, String> greeting() {
    try {
      String g = nestiService.greeting(authFacade.requireUser());
      return Map.of("greeting", g);
    } catch (Exception e) {
      return Map.of("greeting", "Welcome back! How are you feeling today? 💛");
    }
  }
}
