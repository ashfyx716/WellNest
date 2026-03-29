package com.wellnest.controller;

import com.wellnest.service.AuthFacade;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sanctuary")
public class SanctuaryController {

  private final AuthFacade authFacade;

  public SanctuaryController(AuthFacade authFacade) {
    this.authFacade = authFacade;
  }

  /** Friendly health check; active gentle goals use /api/gentle-goal/active */
  @GetMapping("/status")
  public Map<String, Object> status() {
    var u = authFacade.requireUser();
    return Map.of("ok", true, "userId", u.getId());
  }
}
