package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.LoveNoteRequest;
import com.wellnest.model.LoveNote;
import com.wellnest.model.User;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.FamilyService;
import jakarta.validation.Valid;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/love-note")
public class LoveNoteController {

  private final FamilyService familyService;
  private final AuthFacade authFacade;

  public LoveNoteController(FamilyService familyService, AuthFacade authFacade) {
    this.familyService = familyService;
    this.authFacade = authFacade;
  }

  @PostMapping("/send")
  public Map<String, Object> send(@Valid @RequestBody LoveNoteRequest req) {
    LoveNote n = familyService.sendLoveNote(authFacade.requireUser(), req);
    return Map.of(
        "id",
        n.getId(),
        "sentAt",
        n.getSentAt().atOffset(ZoneOffset.UTC).toString());
  }

  @GetMapping("/history")
  public List<Map<String, Object>> history() {
    User u = authFacade.requireUser();
    return familyService.loveNoteHistory(u).stream()
        .map(
            n -> {
              Map<String, Object> item =
                  Map.of(
                      "id",
                      n.getId(),
                      "content",
                      n.getContent(),
                      "sentAt",
                      n.getSentAt().atOffset(ZoneOffset.UTC).toString());
              return item;
            })
        .toList();
  }
}
