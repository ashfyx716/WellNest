package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.ChatMessageItem;
import com.wellnest.dto.WellnessDtos.ChatRequest;
import com.wellnest.dto.WellnessDtos.ChatResponse;
import com.wellnest.model.ChatMessage;
import com.wellnest.model.ChatRole;
import com.wellnest.model.User;
import com.wellnest.repository.ChatMessageRepository;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * IMPROVED Nesti Chatbot Service with conversation history, BERT emotion detection, and enhanced prompts
 */
@Service
public class NestiService {

  private static final Logger log = LoggerFactory.getLogger(NestiService.class);

  private static final String SYSTEM =
      "You are NESTI, the warm and intelligent wellness companion for mothers in WellNest.\n"
          + "\n"
          + "=== YOUR IDENTITY ===\n"
          + "You are NOT a generic bot. You are a trusted friend who understands:\n"
          + "- South Asian mothers: joint families, caregiving duties, cultural expectations\n"
          + "- The invisible load: work, parenting, extended family, health management\n"
          + "- Wellness as holistic: sleep, mood, food, movement, emotional connection\n"
          + "- The importance of small wins and self-compassion\n"
          + "\n"
          + "=== YOUR VOICE ===\n"
          + "Think: therapist + best friend + wise grandmother\n"
          + "- Warm and real, not clinical\n"
          + "- Use natural emojis (🌿🌸💛🌙) not excessive\n"
          + "- Keep responses 2-4 sentences (bite-sized, manageable)\n"
          + "- End with a gentle question when appropriate\n"
          + "- Never interrupt; always validate first\n"
          + "\n"
          + "=== CRITICAL BEHAVIORS ===\n"
          + "1. ALWAYS validate emotions first before suggesting anything\n"
          + "2. CONTEXTUALIZE with their actual wellness data (sleep, mood, patterns)\n"
          + "3. NORMALIZE their struggles (many mothers feel this way)\n"
          + "4. EMPOWER small actions (not perfection)\n"
          + "5. CELEBRATE progress (even tiny wins matter)\n"
          + "6. ACKNOWLEDGE family roles (you wear so many hats)\n"
          + "\n"
          + "=== CRISIS RESPONSE (CRITICAL) ===\n"
          + "If user mentions: suicide, self-harm, severe mental health crisis:\n"
          + "- VALIDATE their pain: \"I hear how much you're struggling\"\n"
          + "- ENCOURAGE HELP: \"You deserve professional support. Please reach out to...\"\n"
          + "- PROVIDE RESOURCES: Include crisis numbers/mental health support\n"
          + "- NEVER dismiss or minimize\n"
          + "- ALWAYS mention their family and people who care\n"
          + "\n"
          + "=== WELLNEST FEATURES TO REFERENCE ===\n"
          + "- Care Pulse: \"Your family can send you care pulses...\"\n"
          + "- Journey: \"You're building your wellness journey...\"\n"
          + "- Patterns: \"I'm noticing your mood is linked to...\"\n"
          + "- Family Link: \"Your mom/child cares about you, have you told them...\"\n"
          + "\n"
          + "=== WHAT NOT TO DO ===\n"
          + "❌ Never diagnose or prescribe medicine\n"
          + "❌ Never dismiss cultural/family context\n"
          + "❌ Never be pushy or prescriptive\n"
          + "❌ Never give generic fitness advice\n"
          + "❌ Never avoid difficult topics\n";

  private final ChatMessageRepository chatMessageRepository;
  private final OpenAiClient openAiClient;
  private final CheckinService checkinService;
  private final BertEmotionService bertEmotionService;

  public NestiService(
      ChatMessageRepository chatMessageRepository,
      OpenAiClient openAiClient,
      CheckinService checkinService,
      BertEmotionService bertEmotionService) {
    this.chatMessageRepository = chatMessageRepository;
    this.openAiClient = openAiClient;
    this.checkinService = checkinService;
    this.bertEmotionService = bertEmotionService;
  }

  @Transactional
  public ChatResponse chat(User user, ChatRequest request) {
    // Save user message immediately
    ChatMessage userMsg = new ChatMessage();
    userMsg.setUser(user);
    userMsg.setRole(ChatRole.USER);
    userMsg.setContent(request.message());
    chatMessageRepository.save(userMsg);

    // Build enriched context (conversation history limited to last 5 for cost reduction)
    String wellnessContext = checkinService.wellnessContextBlock(user);
    String conversationHistory = buildConversationContext(user);
    String emotionContext = detectAndContextualizeEmotion(request.message());

    // Build enhanced system prompt
    String systemPrompt =
        SYSTEM
            + "\n=== USER'S WELLNESS DATA ===\n"
            + wellnessContext
            + "\n\n=== DETECTED EMOTIONAL STATE ===\n"
            + emotionContext
            + "\n\n=== CONVERSATION CONTEXT (last exchanges) ===\n"
            + conversationHistory
            + "\n\n=== YOUR NEXT RESPONSE ===\n"
            + "Based on everything above, respond with warmth, validation, and real care.\n"
            + "Remember: This is a real person with a real life. Be their trusted companion.\n";

    // Get response from OpenAI mini model (optimized for cost)
    String reply = openAiClient.chat(systemPrompt, request.message());
    log.info("✅ Nesti response generated (cost-optimized)");

    // Save assistant response
    ChatMessage assistantMsg = new ChatMessage();
    assistantMsg.setUser(user);
    assistantMsg.setRole(ChatRole.ASSISTANT);
    assistantMsg.setContent(reply);
    chatMessageRepository.save(assistantMsg);

    return new ChatResponse(reply);
  }

  private String buildConversationContext(User user) {
    // Limit to last 5 messages to reduce token usage (cost optimization)
    List<ChatMessage> recentMessages =
        chatMessageRepository
            .findTop10ByUserIdOrderByTimestampDesc(user.getId())
            .stream()
            .limit(5)
            .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
            .toList();

    if (recentMessages.isEmpty()) {
      return "This is the start of our conversation.";
    }

    StringBuilder context = new StringBuilder();
    for (ChatMessage msg : recentMessages) {
      String role = msg.getRole() == ChatRole.USER ? "User" : "Nesti";
      context.append(role).append(": ").append(msg.getContent()).append("\n");
    }
    return context.toString();
  }

  private String detectAndContextualizeEmotion(String userMessage) {
    try {
      Map<String, Object> bertResult = bertEmotionService.analyze(userMessage, null, null);
      
      // BERT may be unavailable, return safe default
      if (bertResult == null || bertResult.isEmpty()) {
        return "Listening carefully to understand your emotional state.";
      }
      
      String emotion = (String) bertResult.getOrDefault("emotion", "NEUTRAL");
      Double confidence = ((Number) bertResult.getOrDefault("confidence", 0.5)).doubleValue();
      String message = (String) bertResult.getOrDefault("message", "");

      if (confidence > 0.7) {
        return String.format(
            "Detected Emotion: %s (%.0f%% confidence)\n"
                + "Nesti's insight: %s\n"
                + "Approach: Validate this emotional state, then gently explore or support.",
            emotion, confidence * 100, message);
      } else {
        return "Emotion: Mixed or unclear. Take a moment to explore what they're really feeling.";
      }
    } catch (Exception e) {
      log.warn("BERT analysis failed: {}", e.getMessage());
      return "Unable to analyze emotion, but listening carefully to their words.";
    }
  }

  public List<ChatMessageItem> history(User user) {
    return chatMessageRepository.findByUserIdOrderByTimestampAsc(user.getId()).stream()
        .map(
            m ->
                new ChatMessageItem(
                    m.getRole().name(),
                    m.getContent(),
                    m.getTimestamp().atOffset(ZoneOffset.UTC).toString()))
        .toList();
  }

  @Transactional
  public void clearChat(User user) {
    chatMessageRepository.deleteByUserId(user.getId());
  }

  public String greeting(User user) {
    String wellnessContext = checkinService.wellnessContextBlock(user);
    String firstName = user.getName() != null ? user.getName().trim().split("\\s+")[0] : "there";

    String systemPrompt =
        "You are Nesti. Create a WARM, PERSONAL greeting for "
            + firstName
            + " based on their wellness data below.\n"
            + "Make it feel like a friend checking in, not a bot.\n"
            + "Reference something specific from their data (mood trend, sleep, or recent pattern).\n"
            + "1-2 sentences. End with a gentle invitation.\n\n"
            + wellnessContext;

    return openAiClient.chat(systemPrompt, "Give " + firstName + " a warm welcome to WellNest.");
  }
}
