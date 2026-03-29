package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.CarePulseResponse;
import com.wellnest.dto.WellnessDtos.CarePulseSendRequest;
import com.wellnest.model.CarePulse;
import com.wellnest.model.User;
import com.wellnest.repository.CarePulseRepository;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.DashboardService;
import com.wellnest.service.FamilyService;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/care-pulse")
public class CarePulseController {

  private final DashboardService dashboardService;
  private final FamilyService familyService;
  private final AuthFacade authFacade;
  private final CarePulseRepository carePulseRepository;

  public CarePulseController(
      DashboardService dashboardService,
      FamilyService familyService,
      AuthFacade authFacade,
      CarePulseRepository carePulseRepository) {
    this.dashboardService = dashboardService;
    this.familyService = familyService;
    this.authFacade = authFacade;
    this.carePulseRepository = carePulseRepository;
  }

  @GetMapping("/latest")
  public CarePulseResponse latest() {
    return dashboardService.latestCarePulse(authFacade.requireUser());
  }

  @PostMapping("/send")
  public CarePulseResponse send(@RequestBody CarePulseSendRequest req) {
    CarePulse pulse =
        familyService.sendCarePulse(authFacade.requireUser(), req);
    return new CarePulseResponse(
        pulse.getId(),
        pulse.getMessage(),
        pulse.getSentAt().atOffset(ZoneOffset.UTC).toString(),
        Boolean.TRUE.equals(pulse.getReadFlag()));
  }

  @GetMapping("/history")
  public List<CarePulseResponse> history() {
    User u = authFacade.requireUser();
    return familyService.carePulseHistory(u).stream()
        .map(
            c ->
                new CarePulseResponse(
                    c.getId(),
                    c.getMessage(),
                    c.getSentAt().atOffset(ZoneOffset.UTC).toString(),
                    Boolean.TRUE.equals(c.getReadFlag())))
        .toList();
  }

  /** Mother's inbox — care pulses received */
  @GetMapping("/inbox")
  public List<CarePulseResponse> inbox() {
    User mother = authFacade.requireUser();
    return carePulseRepository.findByReceiverIdOrderBySentAtDesc(mother.getId()).stream()
        .map(
            c ->
                new CarePulseResponse(
                    c.getId(),
                    c.getMessage(),
                    c.getSentAt().atOffset(ZoneOffset.UTC).toString(),
                    Boolean.TRUE.equals(c.getReadFlag())))
        .toList();
  }
}
