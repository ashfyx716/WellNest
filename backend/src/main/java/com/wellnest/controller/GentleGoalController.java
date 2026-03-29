package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.GentleGoalRequest;
import com.wellnest.model.GentleGoal;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.FamilyService;
import jakarta.validation.Valid;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gentle-goal")
public class GentleGoalController {

  private final FamilyService familyService;
  private final AuthFacade authFacade;

  public GentleGoalController(FamilyService familyService, AuthFacade authFacade) {
    this.familyService = familyService;
    this.authFacade = authFacade;
  }

  @PostMapping("/assign")
  public Map<String, Object> assign(@Valid @RequestBody GentleGoalRequest req) {
    GentleGoal g = familyService.assignGoal(authFacade.requireUser(), req);
    return Map.of(
        "id",
        g.getId(),
        "goalText",
        g.getGoalText(),
        "assignedAt",
        g.getAssignedAt().atOffset(ZoneOffset.UTC).toString());
  }

  @GetMapping("/active")
  public List<Map<String, Object>> active() {
    var goals = familyService.activeGoalsForMother(authFacade.requireUser());
    return goals.stream()
      .map(
        g -> {
          Map<String, Object> item =
            Map.of(
              "id",
              g.getId(),
              "goalText",
              g.getGoalText(),
              "assignedAt",
              g.getAssignedAt().atOffset(ZoneOffset.UTC).toString(),
              "completed",
              g.getCompleted());
          return item;
        })
        .toList();
  }

  @PostMapping("/complete")
  public Map<String, String> complete(@RequestParam Long goalId) {
    familyService.completeGoal(authFacade.requireUser(), goalId);
    return Map.of("status", "ok");
  }
}
