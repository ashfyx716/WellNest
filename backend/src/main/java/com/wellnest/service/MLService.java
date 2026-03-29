package com.wellnest.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MLService {

  @Value("${ml.service.url:http://localhost:8001}")
  private String mlServiceUrl;

  private final RestTemplate restTemplate;

  public MLService(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> analyzeEmotion(
      String text, Long userId, String entryDate, String manualMoodEnumName) {
    try {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("text", text);
      body.put("user_id", userId);
      body.put("entry_date", entryDate);
      if (manualMoodEnumName != null) {
        body.put("manual_mood", manualMoodEnumName);
      }
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> response =
          restTemplate.postForEntity(
              mlServiceUrl + "/ml/bert/analyze",
              new HttpEntity<>(body, headers),
              Map.class);
      return response.getBody() != null ? response.getBody() : Map.of();
    } catch (Exception e) {
      return fallbackBert();
    }
  }

  private Map<String, Object> fallbackBert() {
    return Map.of(
        "detected_emotion",
        Map.of("label", "NEUTRAL", "confidence", 0.5, "all_scores", Map.of("NEUTRAL", 0.5)),
        "nesti_message",
        "",
        "conflicts_with_manual",
        false);
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> discoverTopics(Long userId, List<Map<String, String>> notes) {
    try {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("user_id", userId);
      body.put("notes", notes);
      body.put("num_topics", 3);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> response =
          restTemplate.postForEntity(
              mlServiceUrl + "/ml/lda/topics",
              new HttpEntity<>(body, headers),
              Map.class);
      return response.getBody() != null ? response.getBody() : Map.of();
    } catch (Exception e) {
      return Map.of(
          "topics", List.of(),
          "dominant_topic", Map.of("label", "Not enough data yet", "emoji", "🌿"),
          "insight_message", "Keep journaling 🌿");
    }
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> predictRisk(Long userId, List<Map<String, Object>> history) {
    try {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("user_id", userId);
      body.put("history", history);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> response =
          restTemplate.postForEntity(
              mlServiceUrl + "/ml/rf/predict",
              new HttpEntity<>(body, headers),
              Map.class);
      return response.getBody() != null ? response.getBody() : fallbackRisk();
    } catch (Exception e) {
      return fallbackRisk();
    }
  }

  private Map<String, Object> fallbackRisk() {
    return Map.of(
        "risk_level",
        "LOW",
        "risk_score",
        0.5,
        "risk_label",
        "🟢 Calm week ahead",
        "prediction_message",
        "Keep going 🌿",
        "alert_family",
        false,
        "top_risk_factors",
        List.of("Patterns look stable 🌿"),
        "recommendations",
        List.of("You're doing great 🌸"));
  }
}
