package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.ChartPoint;
import com.wellnest.dto.WellnessDtos.ReportMonthlyResponse;
import com.wellnest.dto.WellnessDtos.ReportWeeklyResponse;
import com.wellnest.model.ActivityLevel;
import com.wellnest.model.DailyEntry;
import com.wellnest.model.User;
import com.wellnest.repository.DailyEntryRepository;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

  private final DailyEntryRepository dailyEntryRepository;
  private final OpenAiClient openAiClient;

  public ReportService(DailyEntryRepository dailyEntryRepository, OpenAiClient openAiClient) {
    this.dailyEntryRepository = dailyEntryRepository;
    this.openAiClient = openAiClient;
  }

  public ReportWeeklyResponse weekly(User user) {
    LocalDate to = LocalDate.now();
    LocalDate from = to.minusDays(6);
    List<DailyEntry> week =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), from, to);
    double sleepSum = 0;
    int sleepN = 0;
    Map<String, Long> moods = new HashMap<>();
    int active = 0;
    for (DailyEntry e : week) {
      if (e.getSleepQuality() != null) {
        sleepSum +=
            switch (e.getSleepQuality()) {
              case GOOD -> 3;
              case OKAY -> 2;
              case POOR -> 1;
            };
        sleepN++;
      }
      if (e.getMood() != null) {
        moods.merge(e.getMood().name(), 1L, Long::sum);
      }
      if (e.getActivity() == ActivityLevel.WALKED || e.getActivity() == ActivityLevel.YOGA) {
        active++;
      }
    }
    double avgSleep = sleepN == 0 ? 0 : Math.round((sleepSum / sleepN) * 10) / 10.0;
    return new ReportWeeklyResponse(avgSleep, moods, active, week.size());
  }

  public ReportMonthlyResponse monthly(User user) {
    LocalDate to = LocalDate.now();
    LocalDate from = to.minusDays(29);
    List<DailyEntry> month =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), from, to);
    Map<LocalDate, DailyEntry> map =
        month.stream().collect(java.util.stream.Collectors.toMap(DailyEntry::getEntryDate, e -> e));
    List<ChartPoint> pts = new java.util.ArrayList<>();
    for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
      DailyEntry e = map.get(d);
      int v = 0;
      if (e != null && e.getMood() != null) {
        v =
            switch (e.getMood()) {
              case HAPPY, CALM -> 4;
              case NEUTRAL -> 2;
              case SAD, STRESSED, TIRED -> 1;
            };
      }
      pts.add(new ChartPoint(d.toString(), v));
    }
    return new ReportMonthlyResponse(pts);
  }

  public String aiInsight(User user) {
    var w = weekly(user);
    var m = monthly(user);
    String data =
        "Weekly avg sleep score (1-3 scale): "
            + w.avgSleepScore()
            + ". Mood counts: "
            + w.moodCounts()
            + ". Active days: "
            + w.activeDays();
    String sys =
        "You are Nesti. Write a warm 3-4 sentence monthly-style insight for a woman's "
            + "wellness report. No medical advice.";
    return openAiClient.chat(sys, data);
  }
}
