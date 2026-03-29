package com.wellnest.controller;

import com.wellnest.dto.WellnessDtos.DailyEntryRequest;
import com.wellnest.dto.WellnessDtos.EmotionDayItem;
import com.wellnest.dto.WellnessDtos.SaveCheckinResponse;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.CheckinService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkin")
public class CheckinController {

  private final CheckinService checkinService;
  private final AuthFacade authFacade;

  public CheckinController(CheckinService checkinService, AuthFacade authFacade) {
    this.checkinService = checkinService;
    this.authFacade = authFacade;
  }

  @PostMapping("/save")
  public SaveCheckinResponse save(@Valid @RequestBody DailyEntryRequest req) {
    return checkinService.save(authFacade.requireUser(), req);
  }

  /** Same as /save — saves entry and runs BERT on notes when ML service is available. */
  @PostMapping("/save-with-analysis")
  public SaveCheckinResponse saveWithAnalysis(@Valid @RequestBody DailyEntryRequest req) {
    return checkinService.save(authFacade.requireUser(), req);
  }

  @GetMapping("/emotion-history")
  public List<EmotionDayItem> emotionHistory() {
    return checkinService.emotionHistory(authFacade.requireUser());
  }

  @GetMapping("/today")
  public Object today() {
    return checkinService.today(authFacade.requireUser()).orElse(null);
  }

  @GetMapping("/insight")
  public Object insight() {
    return checkinService.insight(authFacade.requireUser());
  }
}
