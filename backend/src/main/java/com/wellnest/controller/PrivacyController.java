package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.PrivacyResponse;
import com.wellnest.dto.WellnessDtos.PrivacyUpdateRequest;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.PrivacyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class PrivacyController {

  private final PrivacyService privacyService;
  private final AuthFacade authFacade;

  public PrivacyController(PrivacyService privacyService, AuthFacade authFacade) {
    this.privacyService = privacyService;
    this.authFacade = authFacade;
  }

  @GetMapping("/privacy")
  public PrivacyResponse get() {
    return privacyService.get(authFacade.requireUser());
  }

  @PutMapping("/privacy")
  public PrivacyResponse put(@Valid @RequestBody PrivacyUpdateRequest req) {
    return privacyService.update(authFacade.requireUser(), req);
  }
}
