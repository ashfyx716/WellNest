package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.WellnessTogetherRequest;
import com.wellnest.model.WellnessTogetherInvite;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.FamilyService;
import jakarta.validation.Valid;
import java.time.ZoneOffset;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wellness-together")
public class WellnessTogetherController {

  private final FamilyService familyService;
  private final AuthFacade authFacade;

  public WellnessTogetherController(FamilyService familyService, AuthFacade authFacade) {
    this.familyService = familyService;
    this.authFacade = authFacade;
  }

  @PostMapping("/invite")
  public Map<String, Object> invite(@Valid @RequestBody WellnessTogetherRequest req) {
    WellnessTogetherInvite inv =
        familyService.wellnessTogether(authFacade.requireUser(), req);
    return Map.of(
        "id",
        inv.getId(),
        "message",
        inv.getMessage(),
        "sentAt",
        inv.getSentAt().atOffset(ZoneOffset.UTC).toString());
  }
}
