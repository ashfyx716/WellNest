package com.wellnest.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class OpenAiClient {
  private static final Logger log = LoggerFactory.getLogger(OpenAiClient.class);

  private final RestClient openAiRestClient;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public OpenAiClient(RestClient openAiRestClient) {
    this.openAiRestClient = openAiRestClient;
  }

  @Value("${openai.api.key:}")
  private String apiKey;

  @Value("${openai.model:gpt-4o}")
  private String model;

  @Value("${openai.max.tokens:300}")
  private int maxTokens;

  @Value("${openai.temperature:0.75}")
  private double temperature;

  @Value("${ollama.enabled:true}")
  private boolean ollamaEnabled;

  @Value("${ollama.url:http://localhost:11434/api/chat}")
  private String ollamaUrl;

  @Value("${ollama.model:llama3.2:3b}")
  private String ollamaModel;

  public String chat(String systemPrompt, String userMessage) {
    if (apiKey == null || apiKey.trim().isBlank()) {
      log.warn("OpenAI API key not configured; trying Ollama fallback");
      String ollamaReply = tryOllamaChat(systemPrompt, userMessage);
      if (ollamaReply != null) {
        return ollamaReply;
      }
      return localNestiReply(userMessage);
    }

    try {
      log.debug("Calling OpenAI gpt-4o-mini (cost-optimized, 80 tokens)");
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("model", model);
      body.put(
          "messages",
          List.of(
              Map.of("role", "system", "content", systemPrompt),
              Map.of("role", "user", "content", userMessage)));
      body.put("temperature", temperature);
      body.put("max_tokens", maxTokens);

      String raw =
          openAiRestClient
              .post()
              .uri("https://api.openai.com/v1/chat/completions")
              .contentType(MediaType.APPLICATION_JSON)
              .header("Authorization", "Bearer " + apiKey)
              .body(body)
              .retrieve()
              .body(String.class);

      if (raw == null || raw.isEmpty()) {
        log.warn("Empty response from OpenAI");
        return localNestiReply(userMessage);
      }

      log.debug("OpenAI raw response: {}", raw.substring(0, Math.min(200, raw.length())));
      JsonNode root = objectMapper.readTree(raw);
      
      // Check for API error
      if (root.has("error")) {
        String error = root.path("error").path("message").asText("Unknown error");
        log.error("OpenAI API error: {}", error);
        String ollamaReply = tryOllamaChat(systemPrompt, userMessage);
        if (ollamaReply != null) {
          return ollamaReply;
        }
        return "I'm unable to use live AI right now due to an OpenAI API error: " + error;
      }

      String reply =
          root.path("choices").path(0).path("message").path("content").asText(null);
      if (reply != null && !reply.trim().isEmpty()) {
        log.info("✅ OpenAI response successful (mini model, 80 tokens max)");
        return reply.trim();
      } else {
        log.warn("No content in OpenAI response");
        return localNestiReply(userMessage);
      }
    } catch (RestClientException e) {
      log.error("RestClient error calling OpenAI: {}", e.getMessage(), e);
      String ollamaReply = tryOllamaChat(systemPrompt, userMessage);
      if (ollamaReply != null) {
        return ollamaReply;
      }
      String message = e.getMessage() == null ? "" : e.getMessage();
      if (message.contains("429")) {
        return "I can't access live AI responses right now because OpenAI returned 429 (rate/quota limit). Please check your OpenAI billing/quota, then retry.";
      }
      return "I can't access live AI responses right now due to a network/API issue. Please retry in a minute.";
    } catch (Exception e) {
      log.error("Unexpected error calling OpenAI: {}", e.getMessage(), e);
      return "I'm here with you 🌿 Something went wrong reaching my thoughts — try again soon.";
    }
  }

  private String tryOllamaChat(String systemPrompt, String userMessage) {
    if (!ollamaEnabled) {
      return null;
    }

    try {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("model", ollamaModel);
      body.put(
          "messages",
          List.of(
              Map.of("role", "system", "content", systemPrompt),
              Map.of("role", "user", "content", userMessage)));
      body.put("stream", false);

      String raw =
          openAiRestClient
              .post()
              .uri(ollamaUrl)
              .contentType(MediaType.APPLICATION_JSON)
              .body(body)
              .retrieve()
              .body(String.class);

      if (raw == null || raw.isBlank()) {
        return null;
      }

      JsonNode root = objectMapper.readTree(raw);
      String content = root.path("message").path("content").asText(null);
      if (content != null && !content.trim().isEmpty()) {
        log.info("✅ Ollama response successful");
        return content.trim();
      }
      return null;
    } catch (Exception e) {
      log.debug("Ollama fallback unavailable: {}", e.getMessage());
      return null;
    }
  }

  /**
   * Warm, human-style replies when no OpenAI key is configured (no technical messages shown to
   * users). For richer, context-aware dialogue, set {@code openai.api.key} or {@code
   * OPENAI_API_KEY}. This fallback is WellNest-aware and wellness-focused.
   */
  private String localNestiReply(String userMessage) {
    String m =
        userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT).trim();
    var rnd = ThreadLocalRandom.current();

    // Greetings
    if (m.matches(".*\\b(hi|hello|hey|namaste|good\\s*morning|good\\s*evening|howdy)\\b.*")
        || m.length() < 10 && m.matches("^(hi|hello|hey|namaste)[!.\\s]*$")) {
      String[] pool = {
        "Hello, love 🌸 Welcome to your wellness space. What's on your heart today?",
        "Hi there 💛 I'm Nesti — glad you're here. Tell me how you're really feeling.",
        "Hey 🌿 So good to see you. I'm here to listen and walk with you through your wellness journey.",
        "Namaste 🙏 Take a breath — this is a gentle place. What brought you here today?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Asking about Nesti / how-are-you
    if (m.contains("how are you") || m.contains("how r u") || m.contains("what about you")) {
      String[] pool = {
        "I'm here, steady and listening 💛 I exist to support you. How has *your* heart been?",
        "I'm well when you're well 🌿 I'm curious about your world — what's been weighing on you?",
        "I'm always right here 🌸 More importantly, how have you been sleeping? Moving? Eating?",
        "I'm honored to be here for you 💕 Tell me — what's one thing this week that felt hard?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Gratitude
    if (m.contains("thank")) {
      String[] pool = {
        "You're so welcome 💕 Showing up for yourself this way is already an act of love.",
        "Anytime 🌸 Taking time to connect here is wisdom — be proud of that.",
        "Of course 🌿 You matter deeply. Keep taking these gentle moments for yourself."
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Goodbyes
    if (m.contains("bye") || m.contains("goodbye") || m.contains("good night") || m.contains("goodnight") || m.contains("see you")) {
      String[] pool = {
        "Rest well 🌙 I'll be here whenever you're ready. You matter so much.",
        "Take good care of yourself 🌿 Come back anytime. Your wellness journey is so important.",
        "Sleep peacefully 💛 Remember — you are stronger than you think. Until next time. 🌸"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Stress / Overwhelm / Heavy emotions
    if (m.contains("stress") || m.contains("worried") || m.contains("anxious")
        || m.contains("overwhelm") || m.contains("panic") || m.contains("pressure")) {
      String[] pool = {
        "That weight is real 💛 You don't have to carry it alone. One small breath helps. What's the heaviest part right now?",
        "I can feel the pressure in your words 🌿 It's okay to not be okay. What if you picked just one tiny thing to ease today?",
        "Stress is telling you something matters — and you care deeply 🌸 Can you name what feels most urgent right now?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Sadness / Loneliness
    if (m.contains("sad") || m.contains("depressed") || m.contains("lonely")
        || m.contains("alone") || m.contains("grief") || m.contains("blue")) {
      String[] pool = {
        "That sadness is real, and it's valid 💕 You're not alone in this. What would feel most tender right now?",
        "Loneliness can feel so heavy 🌙 I'm here, and your feelings matter. Tell me more?",
        "Grief and sadness have their own rhythm 🌿 Being gentle with yourself right now is exactly what you need.",
        "You're allowed to feel this 🌸 WellNest is here, and so is anyone who loves you. Can you reach out to one person today?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Tiredness / exhaustion
    if (m.contains("tired") || m.contains("exhausted") || m.contains("fatigue")
        || m.contains("no energy") || m.contains("burnt out")) {
      String[] pool = {
        "Rest is also wellness, and you need it 🌙 Can you give yourself permission to slow down today?",
        "Fatigue is a message 🌿 Your body is asking for gentleness. What if you did one less thing today?",
        "You sound depleted 💛 Is it sleep, emotional energy, caregiving load, or all of it? Let's think together."
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Sleep specifically
    if (m.contains("sleep") || m.contains("insomnia") || m.contains("can't sleep")
        || m.contains("sleepless") || m.contains("waking up")) {
      String[] pool = {
        "Sleep troubles touch everything 🌙 Try a slower evening — dim lights, warm water, let your mind unwind.",
        "Waking up at night can mean your mind is processing something 🌿 Journal before bed; it helps release.",
        "Sleep is so precious when we're women carrying many roles 💛 Can you protect one hour before bed?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Family / responsibility / caregiving
    if (m.contains("family") || m.contains("mother") || m.contains("husband")
        || m.contains("children") || m.contains("kids") || m.contains("care")
        || m.contains("responsibility") || m.contains("duty")) {
      String[] pool = {
        "Family fills and stretches the heart at once 🏠 Your needs matter too. What's the first thing you'd do if you had an hour just for you?",
        "Carrying family duties is sacred, and it's heavy 💛 Have you let anyone know how full your cup is?",
        "Mothers, daughters, wives—we wear so many hats 👑 Which role feels most demanding right now? Let's lighten it together.",
        "Family connection is beautiful and exhausting 🌸 Remember: your wellness helps everyone you love. You're not selfish to care for yourself."
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Work pressure
    if (m.contains("work") || m.contains("job") || m.contains("boss")
        || m.contains("deadline") || m.contains("busy") || m.contains("workload")) {
      String[] pool = {
        "Work demands can consume everything 💼 Is your work-life balance tilted? What boundary could you set this week?",
        "Busyness isn't the same as purpose 🌿 Take a breath — what's *one* thing you can pause or delegate?",
        "Deadlines and demands feel relentless 💛 Can you protect even 10 minutes today for yourself amidst the rush?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Positive/Good mood
    if (m.contains("great") || m.contains("good") || m.contains("happy")
        || m.contains("feeling good") || m.contains("blessed") || m.contains("grateful")) {
      String[] pool = {
        "That joy is real and deserves celebration 🌸 Keep riding this wave — what did you do differently?",
        "You're glowing 💛 This goodness you're feeling is *your* doing. Be proud of that.",
        "More of this, please 🌿 What's making today feel lighter? Let's protect and grow that."
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // WellNest-specific features
    if (m.contains("family connect") || m.contains("care pulse") || m.contains("linked")) {
      String[] pool = {
        "Sending a Care Pulse to your family is love in action 💕 They feel it, I promise.",
        "Family connection is one of WellNest's greatest gifts 🏠 Your loved ones want to support you.",
        "That link you made with family is beautiful 🌸 Use those moments to let them in."
      };
      return pool[rnd.nextInt(pool.length)];
    }

    if (m.contains("guilt") || m.contains("bad") || m.contains("failure")) {
      String[] pool = {
        "Guilt is heavy, and it lies 🌿 You're doing your best with what you have. That's enough.",
        "Being human means imperfection 💛 What would you tell a friend who felt this guilt right now?",
        "'Bad' is a story you're telling yourself 🌸 What's one kind thing you could say to yourself instead?"
      };
      return pool[rnd.nextInt(pool.length)];
    }

    // Generic catch-all responses
    String[] general = {
      "I'm listening with my whole heart 🌿 What you shared matters. Can you tell me more?",
      "Thank you for opening up 💛 I hear you, and you're not alone. What do you need right now?",
      "That lands with me 🌸 I'm here. Would you like to talk through it, or just be heard?",
      "You're doing your best, and that's enough 🌿 What would feel most healing for you right now?",
      "I see you and all you're carrying 💕 What's one kind thing you could offer yourself today?"
    };
    return general[rnd.nextInt(general.length)];
  }
}
