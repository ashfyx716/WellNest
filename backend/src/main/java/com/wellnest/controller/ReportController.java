package com.wellnest.controller;

import com.wellnest.service.AuthFacade;
import com.wellnest.service.ReportService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

  private final ReportService reportService;
  private final AuthFacade authFacade;

  public ReportController(ReportService reportService, AuthFacade authFacade) {
    this.reportService = reportService;
    this.authFacade = authFacade;
  }

  @GetMapping("/weekly")
  public Object weekly() {
    return reportService.weekly(authFacade.requireUser());
  }

  @GetMapping("/monthly")
  public Object monthly() {
    return reportService.monthly(authFacade.requireUser());
  }

  @GetMapping("/ai-insight")
  public Map<String, String> aiInsight() {
    return Map.of("insight", reportService.aiInsight(authFacade.requireUser()));
  }
}
