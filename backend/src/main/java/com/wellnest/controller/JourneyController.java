package com.wellnest.controller;

import com.wellnest.service.AuthFacade;
import com.wellnest.service.JourneyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/journey")
public class JourneyController {

  private final JourneyService journeyService;
  private final AuthFacade authFacade;

  public JourneyController(JourneyService journeyService, AuthFacade authFacade) {
    this.journeyService = journeyService;
    this.authFacade = authFacade;
  }

  @GetMapping("/tree-status")
  public Object treeStatus() {
    return journeyService.treeStatus(authFacade.requireUser());
  }

  @GetMapping("/calendar")
  public Object calendar() {
    return journeyService.calendar(authFacade.requireUser(), 30);
  }

  @GetMapping("/charts")
  public Object charts() {
    return journeyService.charts(authFacade.requireUser());
  }

  @GetMapping("/badges")
  public Object badges() {
    return journeyService.badges(authFacade.requireUser());
  }

  @GetMapping("/milestones")
  public Object milestones() {
    return journeyService.milestones(authFacade.requireUser());
  }
}
