package com.wellnest.controller;

import com.wellnest.dto.AuthDtos.UserMeResponse;
import com.wellnest.dto.WellnessDtos.LinkMotherRequest;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.FamilyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family")
public class FamilyController {

  private final FamilyService familyService;
  private final AuthFacade authFacade;

  public FamilyController(FamilyService familyService, AuthFacade authFacade) {
    this.familyService = familyService;
    this.authFacade = authFacade;
  }

  @PostMapping("/link")
  public UserMeResponse link(@Valid @RequestBody LinkMotherRequest req) {
    return familyService.linkMother(authFacade.requireUser(), req);
  }

  @GetMapping("/mom-summary")
  public Object momSummary() {
    return familyService.momSummary(authFacade.requireUser());
  }

  @GetMapping("/mom-calendar")
  public Object momCalendar() {
    return familyService.momCalendar(authFacade.requireUser());
  }

  @GetMapping("/archive")
  public Object archive() {
    return familyService.loveArchive(authFacade.requireUser());
  }

  @GetMapping("/mom-ml-risk")
  public Object momMlRisk() {
    return familyService.momMlRiskForFamily(authFacade.requireUser());
  }

  @GetMapping("/mom-care-guide")
  public Object momCareGuide() {
    return familyService.momCareGuide(authFacade.requireUser());
  }

  @GetMapping("/mom-inbox")
  public Object momInbox() {
    return familyService.momInbox(authFacade.requireUser());
  }
}
