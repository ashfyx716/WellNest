package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.DailyEntryRequest;
import com.wellnest.dto.WellnessDtos.DailyEntryResponse;
import com.wellnest.dto.WellnessDtos.EmotionDayItem;
import com.wellnest.dto.WellnessDtos.InsightResponse;
import com.wellnest.dto.WellnessDtos.SaveCheckinResponse;
import com.wellnest.model.DailyEntry;
import com.wellnest.model.MoodType;
import com.wellnest.model.User;
import com.wellnest.repository.DailyEntryRepository;
import com.wellnest.repository.UserRepository;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckinService {

  private final DailyEntryRepository dailyEntryRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final OpenAiClient openAiClient;
  private final MLService mlService;
  private final BertEmotionService bertEmotionService;

  public CheckinService(
      DailyEntryRepository dailyEntryRepository,
      UserRepository userRepository,
      NotificationService notificationService,
      OpenAiClient openAiClient,
      MLService mlService,
      BertEmotionService bertEmotionService) {
    this.dailyEntryRepository = dailyEntryRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.openAiClient = openAiClient;
    this.mlService = mlService;
    this.bertEmotionService = bertEmotionService;
  }

  @Transactional
  public SaveCheckinResponse save(User user, DailyEntryRequest req) {
    LocalDate today = LocalDate.now();
    DailyEntry entry =
      dailyEntryRepository
        .findByUserAndEntryDate(user, today)
        .orElseGet(
            () -> {
              DailyEntry created = new DailyEntry();
              created.setUser(user);
              created.setEntryDate(today);
              return created;
            });
    entry.setSleepQuality(req.sleepQuality());
    entry.setActivity(req.activity());
    entry.setDiet(req.diet());
    entry.setMood(req.mood());
    entry.setNotes(req.notes());
    entry = dailyEntryRepository.save(entry);

    Map<String, Object> bertResult = new LinkedHashMap<>();
    if (req.notes() != null && !req.notes().isBlank()) {
      Map<String, Object> bert =
          bertEmotionService.analyze(req.notes(), user.getId(), today.toString());
      if (bert == null || bert.isEmpty() || !bert.containsKey("emotion")) {
        bert =
            mlService.analyzeEmotion(
                req.notes(),
                user.getId(),
                today.toString(),
                req.mood() != null ? req.mood().name() : null);
      }
      applyBertToEntry(entry, bert);
      entry = dailyEntryRepository.save(entry);
      bertResult = buildBertResultForClient(entry);
    }

    maybeNotifyFamilyOnStress(user, entry);

    return new SaveCheckinResponse(toResponse(entry), bertResult);
  }

  private void maybeNotifyFamilyOnStress(User motherUser, DailyEntry entry) {
    if (motherUser.getId() == null) {
      return;
    }

    boolean alertNow = isAlertMood(entry.getMood()) || isAlertEmotion(entry.getBertDetectedEmotion());
    if (!alertNow) {
      return;
    }

    List<User> linkedFamily = userRepository.findByLinkedMother_Id(motherUser.getId());
    for (User family : linkedFamily) {
      if (family.getId() == null) {
        continue;
      }
      notificationService.create(
          family.getId(),
          "MOM_HIGH_STRESS",
          "Mom Needs Attention",
          "Your mother logged high stress today. A gentle check-in could help right now.");
    }
  }

  private static boolean isAlertMood(MoodType mood) {
    return mood == MoodType.STRESSED || mood == MoodType.SAD;
  }

  private static boolean isAlertEmotion(String emotion) {
    if (emotion == null || emotion.isBlank()) {
      return false;
    }
    String e = emotion.trim().toUpperCase();
    return e.contains("STRESS") || e.contains("SAD") || e.contains("ANGER") || e.contains("FEAR");
  }

  @SuppressWarnings("unchecked")
  private void applyBertToEntry(DailyEntry entry, Map<String, Object> bert) {
    if (bert == null) {
      return;
    }
    if (bert.containsKey("emotion") && bert.get("emotion") != null) {
      entry.setBertDetectedEmotion(String.valueOf(bert.get("emotion")));
      Object c = bert.get("confidence");
      if (c instanceof Number n) {
        entry.setBertConfidence(n.doubleValue());
      }
      Object msg = bert.get("message");
      if (msg != null) {
        entry.setBertNestiMessage(String.valueOf(msg));
      }
      Object conflict = bert.get("conflicts_with_manual");
      if (conflict instanceof Boolean b) {
        entry.setBertConflictsWithManual(b);
      }
      return;
    }
    Object de = bert.get("detected_emotion");
    if (de instanceof Map<?, ?> m) {
      Object label = m.get("label");
      if (label != null) {
        entry.setBertDetectedEmotion(String.valueOf(label));
      }
      Object c = m.get("confidence");
      if (c instanceof Number n) {
        entry.setBertConfidence(n.doubleValue());
      }
    }
    Object conflict = bert.get("conflicts_with_manual");
    if (conflict instanceof Boolean b) {
      entry.setBertConflictsWithManual(b);
    }
    Object msg = bert.get("nesti_message");
    if (msg != null) {
      entry.setBertNestiMessage(String.valueOf(msg));
    }
  }

  private Map<String, Object> buildBertResultForClient(DailyEntry entry) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("emotion", entry.getBertDetectedEmotion());
    m.put("confidence", entry.getBertConfidence());
    m.put("message", entry.getBertNestiMessage());
    return m;
  }

  public List<EmotionDayItem> emotionHistory(User user) {
    return dailyEntryRepository.findTop7ByUserIdOrderByEntryDateDesc(user.getId()).stream()
        .filter(e -> e.getBertDetectedEmotion() != null && !e.getBertDetectedEmotion().isBlank())
        .map(
            e ->
                new EmotionDayItem(
                    e.getEntryDate(),
                    e.getBertDetectedEmotion(),
                    e.getBertConfidence(),
                    e.getBertNestiMessage()))
        .toList();
  }

  public Optional<DailyEntryResponse> today(User user) {
    return dailyEntryRepository
        .findByUserAndEntryDate(user, LocalDate.now())
        .map(this::toResponse);
  }

  public InsightResponse insight(User user) {
    Optional<DailyEntry> opt =
        dailyEntryRepository.findByUserAndEntryDate(user, LocalDate.now());
    if (opt.isEmpty()) {
      return new InsightResponse(
          "Nothing logged yet — that's okay 🌿 Come back when you're ready.");
    }
    DailyEntry e = opt.get();
    String summary =
        String.format(
            "Today's check-in: sleep=%s, activity=%s, diet=%s, mood=%s. Notes: %s",
            e.getSleepQuality(),
            e.getActivity(),
            e.getDiet(),
            e.getMood(),
            e.getNotes() != null ? e.getNotes() : "(none)");
    String system =
        "You are Nesti. In 2-4 warm sentences, acknowledge this day's wellness log for "
            + "a middle-aged woman. No medical advice. Soft emojis.";
    return new InsightResponse(openAiClient.chat(system, summary));
  }

  private DailyEntryResponse toResponse(DailyEntry e) {
    return new DailyEntryResponse(
        e.getId(),
        e.getEntryDate(),
        e.getSleepQuality(),
        e.getActivity(),
        e.getDiet(),
        e.getMood(),
        e.getNotes(),
        e.getBertDetectedEmotion(),
        e.getBertConfidence(),
        e.getBertConflictsWithManual(),
        e.getBertNestiMessage());
  }

  public String wellnessContextBlock(User user) {
    var recent = dailyEntryRepository.findTop7ByUserIdOrderByEntryDateDesc(user.getId());
    if (recent.isEmpty()) {
      return "No recent entries yet. This is their first time here. Be extra warm and encouraging.";
    }

    // Build detailed log
    StringBuilder sb = new StringBuilder();
    sb.append("Last 7 days of wellness logs:\n");
    for (DailyEntry d : recent) {
      sb.append(
          String.format(
              "  %s → mood: %s | sleep: %s | activity: %s | diet: %s | notes: %s\n",
              d.getEntryDate(),
              d.getMood(),
              d.getSleepQuality(),
              d.getActivity(),
              d.getDiet(),
              d.getNotes() != null && !d.getNotes().isBlank() ? d.getNotes() : "(none)"));
    }

    // Analyze patterns
    DailyEntry latest = recent.get(0);
    long calmCount = recent.stream().filter(e -> e.getMood().name().equals("CALM")).count();
    long stressedCount = recent.stream().filter(e -> e.getMood().name().equals("STRESSED")).count();
    long tiredCount = recent.stream().filter(e -> e.getMood().name().equals("TIRED")).count();
    
    sb.append("\nMood trend (7-day): ");
    if (calmCount >= recent.size() / 2) {
      sb.append("Mostly calm and grounded 🌿");
    } else if (stressedCount > tiredCount && stressedCount > 2) {
      sb.append("Some stress lately — likely carrying burden 💛");
    } else if (tiredCount > 2) {
      sb.append("Fatigue is present — rest-deprived or emotionally drained 🌙");
    } else {
      sb.append("Mixed patterns — variable wellness state");
    }

    // Check emotional notes for themes
    String allNotes = recent.stream()
        .map(e -> e.getNotes() != null ? e.getNotes().toLowerCase() : "")
        .reduce("", (a, b) -> a + " " + b);
    
    if (allNotes.contains("family") || allNotes.contains("kids") || allNotes.contains("children")) {
      sb.append("\n⚠ Family/caregiving themes detected in notes — acknowledge dual roles.");
    }
    if (allNotes.contains("work") || allNotes.contains("busy")) {
      sb.append("\n⚠ Work pressure or busyness noted — validate the juggle.");
    }
    if (allNotes.contains("grateful") || allNotes.contains("thank")) {
      sb.append("\n✓ Gratitude/positive framing observed — build on this inner strength.");
    }

    sb.append("\nToday's state: mood is ").append(latest.getMood().name().toLowerCase()).append(" 🌸");
    
    return sb.toString();
  }

  public MoodType latestMoodAura(User user) {
    return dailyEntryRepository
        .findTop7ByUserIdOrderByEntryDateDesc(user.getId())
        .stream()
        .findFirst()
        .map(DailyEntry::getMood)
        .orElse(MoodType.NEUTRAL);
  }
}
