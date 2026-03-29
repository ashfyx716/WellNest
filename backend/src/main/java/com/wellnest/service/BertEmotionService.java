package com.wellnest.service;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Optional FastAPI BERT microservice (default port 8002). Falls back to empty map when
 * unavailable; {@link CheckinService} then uses {@link MLService}.
 */
@Service
public class BertEmotionService {

  @Value("${bert.emotion.url:http://localhost:8002}")
  private String bertEmotionUrl;

  private final RestTemplate restTemplate;

  public BertEmotionService(RestTemplate restTemplate) {
    this.restTemplate = restTemplate;
  }

  @SuppressWarnings("unchecked")
  public Map<String, Object> analyze(String text, Long userId, String entryDate) {
    try {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("text", text);
      body.put("user_id", userId);
      body.put("entry_date", entryDate);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      ResponseEntity<Map> response =
          restTemplate.postForEntity(
              bertEmotionUrl + "/bert/analyze", new HttpEntity<>(body, headers), Map.class);
      return response.getBody() != null ? response.getBody() : Map.of();
    } catch (Exception e) {
      return Map.of();
    }
  }
}
