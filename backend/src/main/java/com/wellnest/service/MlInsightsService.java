package com.wellnest.service;

import com.wellnest.model.DailyEntry;
import com.wellnest.model.User;
import com.wellnest.repository.DailyEntryRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class MlInsightsService {

  private final DailyEntryRepository dailyEntryRepository;
  private final MLService mlService;

  public MlInsightsService(DailyEntryRepository dailyEntryRepository, MLService mlService) {
    this.dailyEntryRepository = dailyEntryRepository;
    this.mlService = mlService;
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> getMlInsights(User user) {
    List<DailyEntry> entries =
        dailyEntryRepository.findTop30ByUserIdOrderByEntryDateDesc(user.getId());

    List<Map<String, Object>> history = new ArrayList<>();
    for (DailyEntry e : entries) {
      history.add(entryToHistoryMap(e));
    }

    Map<String, Object> riskPrediction = mlService.predictRisk(user.getId(), history);

    List<Map<String, String>> notes = new ArrayList<>();
    for (DailyEntry e : entries) {
      if (e.getNotes() != null && !e.getNotes().isBlank()) {
        Map<String, String> n = new LinkedHashMap<>();
        n.put("entry_date", e.getEntryDate().toString());
        n.put("text", e.getNotes());
        if (e.getMood() != null) {
          n.put("mood", e.getMood().name());
        }
        notes.add(n);
      }
    }

    Map<String, Object> topicInsights =
        notes.size() >= 3
            ? mlService.discoverTopics(user.getId(), notes)
            : Map.of(
                "topics",
                List.of(),
                "dominant_topic",
                Map.of("label", "Not enough data yet", "emoji", "🌿"),
                "insight_message",
                "Add more notes to unlock topic insights 🌿");

    return Map.of(
        "risk_prediction", riskPrediction,
        "topic_insights", topicInsights,
        "notes_logged_count", notes.size());
  }

  private Map<String, Object> entryToHistoryMap(DailyEntry e) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("entry_date", e.getEntryDate().toString());
    m.put("sleep_quality", e.getSleepQuality() != null ? e.getSleepQuality().name() : "OKAY");
    m.put("activity", e.getActivity() != null ? e.getActivity().name() : "RESTED");
    m.put("diet", e.getDiet() != null ? e.getDiet().name() : "NORMAL");
    m.put("mood", e.getMood() != null ? e.getMood().name() : "NEUTRAL");
    return m;
  }
}
