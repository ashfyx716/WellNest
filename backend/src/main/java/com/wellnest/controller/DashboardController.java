package com.wellnest.controller;

import com.wellnest.service.AuthFacade;
import com.wellnest.service.DashboardService;
import com.wellnest.service.MlInsightsService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final DashboardService dashboardService;
  private final MlInsightsService mlInsightsService;
  private final AuthFacade authFacade;

  public DashboardController(
      DashboardService dashboardService,
      MlInsightsService mlInsightsService,
      AuthFacade authFacade) {
    this.dashboardService = dashboardService;
    this.mlInsightsService = mlInsightsService;
    this.authFacade = authFacade;
  }

  @GetMapping("/summary")
  public Object summary() {
    return dashboardService.summary(authFacade.requireUser());
  }

  @GetMapping("/suggestion")
  public Map<String, String> suggestion() {
    return Map.of("suggestion", dashboardService.suggestion(authFacade.requireUser()));
  }

  @GetMapping("/ml-insights")
  public Map<String, Object> mlInsights() {
    return mlInsightsService.getMlInsights(authFacade.requireUser());
  }
}
