package com.wellnest.service;

import com.wellnest.dto.AuthDtos.UserMeResponse;
import com.wellnest.dto.WellnessDtos.*;
import com.wellnest.model.*;
import com.wellnest.repository.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FamilyService {

  private final UserRepository userRepository;
  private final DailyEntryRepository dailyEntryRepository;
  private final PrivacySettingsRepository privacySettingsRepository;
  private final CarePulseRepository carePulseRepository;
  private final VoiceHugRepository voiceHugRepository;
  private final GentleGoalRepository gentleGoalRepository;
  private final LoveNoteRepository loveNoteRepository;
  private final WellnessTogetherInviteRepository wellnessTogetherInviteRepository;
  private final NotificationService notificationService;
  private final JourneyService journeyService;
  private final MLService mlService;

  public FamilyService(
      UserRepository userRepository,
      DailyEntryRepository dailyEntryRepository,
      PrivacySettingsRepository privacySettingsRepository,
      CarePulseRepository carePulseRepository,
      VoiceHugRepository voiceHugRepository,
      GentleGoalRepository gentleGoalRepository,
      LoveNoteRepository loveNoteRepository,
      WellnessTogetherInviteRepository wellnessTogetherInviteRepository,
      NotificationService notificationService,
      JourneyService journeyService,
      MLService mlService) {
    this.userRepository = userRepository;
    this.dailyEntryRepository = dailyEntryRepository;
    this.privacySettingsRepository = privacySettingsRepository;
    this.carePulseRepository = carePulseRepository;
    this.voiceHugRepository = voiceHugRepository;
    this.gentleGoalRepository = gentleGoalRepository;
    this.loveNoteRepository = loveNoteRepository;
    this.wellnessTogetherInviteRepository = wellnessTogetherInviteRepository;
    this.notificationService = notificationService;
    this.journeyService = journeyService;
    this.mlService = mlService;
  }

  @Value("${wellnest.upload.dir:uploads}")
  private String uploadDir;

  private User requireMother(User familyUser) {
    if (familyUser.getRole() != Role.FAMILY) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Family role required");
    }
    if (familyUser.getLinkedMother() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link to mom first");
    }
    return userRepository
        .findById(familyUser.getLinkedMother().getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mother missing"));
  }

  private PrivacySettings privacy(User mother) {
    return privacySettingsRepository
        .findByUserId(mother.getId())
        .orElseGet(
            () -> {
              PrivacySettings created = new PrivacySettings();
              created.setUser(mother);
              return privacySettingsRepository.save(created);
            });
  }

  @Transactional
  public UserMeResponse linkMother(User familyUser, LinkMotherRequest req) {
    if (familyUser.getRole() != Role.FAMILY) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Family role required");
    }
    User mother =
        userRepository
            .findByEmailAndRole(req.motherEmail(), Role.MOTHER)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mother not found"));
    familyUser.setLinkedMother(mother);
    userRepository.save(familyUser);
    return new UserMeResponse(
        familyUser.getId(),
        familyUser.getName(),
        familyUser.getEmail(),
        familyUser.getPhone(),
        familyUser.getRole(),
        mother.getId());
  }

  public MomSummaryResponse momSummary(User familyUser) {
    if (familyUser.getRole() != Role.FAMILY || familyUser.getLinkedMother() == null) {
      return new MomSummaryResponse(
          "\uD83C\uDF3F", "—", List.of(), "Mom hasn't linked yet \uD83C\uDF3F", "neutral");
    }
    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (p.getPrivacyLevel() == PrivacyLevel.PRIVATE) {
      return new MomSummaryResponse(
          "\uD83D\uDD12",
          "Private",
          List.of(),
          "Mom's wellness is private — you can still send love \uD83D\uDC95",
          "private");
    }

    var todayOpt = dailyEntryRepository.findByUserAndEntryDate(mother, LocalDate.now());
    MoodType mood = todayOpt.map(DailyEntry::getMood).orElse(null);
    String emoji = moodEmoji(mood);
    String label = mood == null ? "No log today" : mood.name();

    LocalDate to = LocalDate.now();
    LocalDate from = to.minusDays(6);
    List<DailyEntry> week =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            mother.getId(), from, to);
    List<Double> spark = new ArrayList<>();
    Map<LocalDate, DailyEntry> map =
        week.stream().collect(Collectors.toMap(DailyEntry::getEntryDate, e -> e));
    for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
      DailyEntry e = map.get(d);
      spark.add(e != null && e.getMood() != null ? moodScore(e.getMood()) : 0.0);
    }

    String tone;
    String msg;
    if (todayOpt.isEmpty()) {
      tone = "neutral";
      msg = "Mom hasn't logged today \uD83C\uDF3F";
    } else if (mood == MoodType.STRESSED || mood == MoodType.SAD) {
      tone = "alert";
      msg = "Mom might need some love today \uD83D\uDC95";
    } else if (mood == MoodType.HAPPY || mood == MoodType.CALM) {
      tone = "good";
      msg = "Mom is flourishing! \uD83C\uDF38";
    } else {
      tone = "neutral";
      msg = "Mom is taking it one day at a time \uD83C\uDF31";
    }

    if (p.getPrivacyLevel() == PrivacyLevel.SUMMARY) {
      label = "Summary";
      spark = List.of();
    }

    return new MomSummaryResponse(emoji, label, spark, msg, tone);
  }

  public JourneyCalendarResponse momCalendar(User familyUser) {
    if (familyUser.getRole() != Role.FAMILY || familyUser.getLinkedMother() == null) {
      return new JourneyCalendarResponse(List.of());
    }
    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (!Boolean.TRUE.equals(p.getShareCalendar())
        || p.getPrivacyLevel() == PrivacyLevel.PRIVATE
        || p.getPrivacyLevel() == PrivacyLevel.SUMMARY) {
      return new JourneyCalendarResponse(List.of());
    }
    return journeyService.calendar(mother, 30);
  }

  @Transactional
  public CarePulse sendCarePulse(User familyUser, CarePulseSendRequest req) {
    User mother = requireMother(familyUser);
    String msg =
        req.message() != null && !req.message().isBlank()
            ? req.message()
            : "Thinking about you \uD83D\uDC9B";
    CarePulse pulse = new CarePulse();
    pulse.setSender(familyUser);
    pulse.setReceiver(mother);
    pulse.setMessage(msg);
    pulse = carePulseRepository.save(pulse);
    notificationService.create(
        mother.getId(),
        "CARE_PULSE",
        "Family love",
        "Your family is thinking of you \uD83D\uDC95");
    return pulse;
  }

  @Transactional
  public VoiceHug sendVoiceHug(User familyUser, MultipartFile file, int durationSeconds)
      throws Exception {
    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (!Boolean.TRUE.equals(p.getAllowVoice())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Voice hugs not allowed by mom");
    }
    Path dir = Path.of(uploadDir, "voices").toAbsolutePath().normalize();
    Files.createDirectories(dir);
    String name = UUID.randomUUID() + "_" + Objects.requireNonNullElse(file.getOriginalFilename(), "voice.webm");
    Path target = dir.resolve(name);
    Files.copy(file.getInputStream(), target);
    String url = "/uploads/voices/" + name;
    VoiceHug hug = new VoiceHug();
    hug.setSender(familyUser);
    hug.setReceiver(mother);
    hug.setAudioUrl(url);
    hug.setDurationSeconds(durationSeconds);
    hug = voiceHugRepository.save(hug);
    notificationService.create(
        mother.getId(), "VOICE_HUG", "Voice hug", "A voice hug is waiting \uD83C\uDFA4");
    return hug;
  }

  @Transactional
  public GentleGoal assignGoal(User familyUser, GentleGoalRequest req) {
    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (!Boolean.TRUE.equals(p.getAllowGoals())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Goals not allowed");
    }
    GentleGoal g = new GentleGoal();
    g.setAssignedBy(familyUser);
    g.setAssignedTo(mother);
    g.setGoalText(req.goalText());
    g = gentleGoalRepository.save(g);
    notificationService.create(
        mother.getId(),
        "GENTLE_GOAL",
        "Gentle goal",
        "A gentle goal from your family \uD83C\uDF3C");
    return g;
  }

  @Transactional
  public WellnessTogetherInvite wellnessTogether(User familyUser, WellnessTogetherRequest req) {
    User mother = requireMother(familyUser);
    WellnessTogetherInvite inv = new WellnessTogetherInvite();
    inv.setInviter(familyUser);
    inv.setInvitee(mother);
    inv.setMessage(req.message());
    inv = wellnessTogetherInviteRepository.save(inv);
    notificationService.create(
        mother.getId(),
        "WELLNESS_TOGETHER",
        "Together",
        "A shared wellness invite \uD83E\uDDD8");
    return inv;
  }

  @Transactional
  public LoveNote sendLoveNote(User familyUser, LoveNoteRequest req) {
    User mother = requireMother(familyUser);
    LoveNote note = new LoveNote();
    note.setSender(familyUser);
    note.setReceiver(mother);
    note.setContent(req.content());
    note = loveNoteRepository.save(note);
    notificationService.create(
        mother.getId(),
        "LOVE_NOTE",
        "Love note",
        "A letter from your family \uD83D\uDC8C");
    return note;
  }

  public List<CarePulse> carePulseHistory(User familyUser) {
    return carePulseRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
  }

  public List<VoiceHug> voiceHugHistory(User familyUser) {
    return voiceHugRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
  }

  public VoiceHug getVoiceHug(Long voiceHugId) {
    return voiceHugRepository.findById(voiceHugId).orElse(null);
  }

  public List<LoveNote> loveNoteHistory(User familyUser) {
    return loveNoteRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
  }

  public List<GentleGoal> activeGoalsForMother(User mother) {
    return gentleGoalRepository.findByAssignedToIdAndCompletedFalseOrderByAssignedAtDesc(
        mother.getId());
  }

  @Transactional
  public void completeGoal(User mother, Long goalId) {
    GentleGoal g =
        gentleGoalRepository
            .findById(goalId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    if (!g.getAssignedTo().getId().equals(mother.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
    g.setCompleted(true);
    gentleGoalRepository.save(g);
  }

  public List<ArchiveItem> loveArchive(User familyUser) {
    List<LoveNote> notes = loveNoteRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
    List<CarePulse> pulses =
        carePulseRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
    List<VoiceHug> hugs = voiceHugRepository.findBySenderIdOrderBySentAtDesc(familyUser.getId());
    List<ArchiveItem> items = new ArrayList<>();
    for (LoveNote n : notes) {
      items.add(
          new ArchiveItem(
              "NOTE",
              n.getId(),
              truncate(n.getContent(), 80),
              n.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              null));
    }
    for (CarePulse c : pulses) {
      items.add(
          new ArchiveItem(
              "PULSE",
              c.getId(),
              truncate(c.getMessage(), 80),
              c.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              null));
    }
    for (VoiceHug v : hugs) {
      items.add(
          new ArchiveItem(
              "VOICE",
              v.getId(),
              "Voice message",
              v.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              v.getAudioUrl()));
    }
    items.sort(Comparator.comparing(ArchiveItem::date).reversed());
    return items;
  }

  public MomCareGuideResponse momCareGuide(User familyUser) {
    if (familyUser.getRole() != Role.FAMILY || familyUser.getLinkedMother() == null) {
      return new MomCareGuideResponse(
          "🌿",
          "—",
          "unknown",
          "stable",
          "Link to mom to get support guidance",
          List.of("Link to mom first"),
          List.of(),
          List.of(),
          "Show up with kindness and consistency 💛");
    }

    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (p.getPrivacyLevel() == PrivacyLevel.PRIVATE) {
      return new MomCareGuideResponse(
          "🔒",
          "Private",
          "private",
          "stable",
          "Mom keeps details private — you can still offer support",
          List.of("Send a gentle check-in", "Offer practical help"),
          List.of("Don't pressure for details"),
          List.of(
              new CareRecommendation("Send a Care Pulse", "A short caring note", "❤️", "care_pulse")),
          "Presence matters more than perfect words.");
    }

    LocalDate to = LocalDate.now();
    LocalDate from = to.minusDays(6);
    List<DailyEntry> week =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            mother.getId(), from, to);

    MoodType mood =
        dailyEntryRepository.findByUserAndEntryDate(mother, LocalDate.now())
            .map(DailyEntry::getMood)
            .orElse(null);

    int neg = 0;
    int pos = 0;
    int known = 0;
    for (DailyEntry e : week) {
      MoodType m = e.getMood();
      if (m == null) {
        continue;
      }
      known++;
      if (m == MoodType.STRESSED || m == MoodType.SAD || m == MoodType.TIRED) {
        neg++;
      }
      if (m == MoodType.HAPPY || m == MoodType.CALM) {
        pos++;
      }
    }

    String moodTrend = "stable";
    if (known >= 4) {
      List<DailyEntry> recent = week.subList(Math.max(0, week.size() - 3), week.size());
      List<DailyEntry> previous = week.subList(Math.max(0, week.size() - 6), Math.max(0, week.size() - 3));
      int recentNeg = 0;
      int previousNeg = 0;
      for (DailyEntry e : recent) {
        MoodType m = e.getMood();
        if (m == MoodType.STRESSED || m == MoodType.SAD || m == MoodType.TIRED) recentNeg++;
      }
      for (DailyEntry e : previous) {
        MoodType m = e.getMood();
        if (m == MoodType.STRESSED || m == MoodType.SAD || m == MoodType.TIRED) previousNeg++;
      }
      if (recentNeg > previousNeg) moodTrend = "declining";
      else if (recentNeg < previousNeg) moodTrend = "improving";
    }

    String wellnessLevel;
    if (mood == MoodType.STRESSED || mood == MoodType.SAD) {
      wellnessLevel = "low";
    } else if (mood == MoodType.TIRED || mood == MoodType.NEUTRAL) {
      wellnessLevel = "okay";
    } else if (mood == MoodType.HAPPY || mood == MoodType.CALM) {
      wellnessLevel = "good";
    } else {
      wellnessLevel = neg >= 2 ? "okay" : "good";
    }

    String trendDescription;
    if (mood == null) {
      trendDescription =
          known == 0 ? "No mood logs in the last 7 days" : "No log today — based on recent pattern";
    } else if (moodTrend.equals("declining")) {
      trendDescription = "Mood trend dipped this week; gentle support can help today";
    } else if (moodTrend.equals("improving")) {
      trendDescription = "Mood trend is improving; keep steady support";
    } else {
      trendDescription = wellnessLevel.equals("low") ? "Today seems emotionally heavy" : "Today appears relatively steady";
    }

    List<String> dos;
    List<String> donts;
    List<CareRecommendation> suggestions;

    if (wellnessLevel.equals("low")) {
      dos = List.of("Do a short check-in: 'I'm here for you'", "Offer one concrete help (meal/errand)");
      donts = List.of("Avoid advice-first replies", "Avoid asking too many questions at once");
      suggestions = List.of(
          new CareRecommendation("Send a Care Pulse", "Keep it short and kind", "❤️", "care_pulse"),
          new CareRecommendation("Plan a gentle visit", "Even 20-30 minutes can help", "🤗", "visit"));
    } else if (wellnessLevel.equals("okay")) {
      dos = List.of("Check in once today", "Encourage rest and small wins");
      donts = List.of("Don't push long conversations", "Don't assume everything is perfect");
      suggestions = List.of(
          new CareRecommendation("Send a check-in text", "Simple and warm", "💬", "checkin"),
          new CareRecommendation("Send a Care Pulse", "A supportive reminder", "❤️", "care_pulse"));
    } else {
      dos = List.of("Share a positive moment", "Plan quality time this week");
      donts = List.of("Don't disappear when things seem okay", "Don't make support conditional");
      suggestions = List.of(
          new CareRecommendation("Send appreciation", "Tell her one thing you value", "🌸", "care_pulse"));
    }

    return new MomCareGuideResponse(
        moodEmoji(mood),
        mood == null ? "No log today" : mood.name(),
        wellnessLevel,
        moodTrend,
        trendDescription,
        dos,
        donts,
        suggestions,
        "Small, consistent support helps a lot.");
  }

  public List<MomInboxItem> momInbox(User motherUser) {
    if (motherUser.getRole() != Role.MOTHER) {
      return List.of();
    }

    List<MomInboxItem> items = new ArrayList<>();
    for (LoveNote n : loveNoteRepository.findByReceiverIdOrderBySentAtDesc(motherUser.getId())) {
      items.add(
          new MomInboxItem(
              "NOTE",
              n.getId(),
              n.getSender() != null ? n.getSender().getName() : "Family",
              n.getContent(),
              n.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              null));
    }
    for (VoiceHug v : voiceHugRepository.findByReceiverIdOrderBySentAtDesc(motherUser.getId())) {
      items.add(
          new MomInboxItem(
              "VOICE",
              v.getId(),
              v.getSender() != null ? v.getSender().getName() : "Family",
              "Voice message",
              v.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              v.getAudioUrl()));
    }
    for (CarePulse c : carePulseRepository.findByReceiverIdOrderBySentAtDesc(motherUser.getId())) {
      items.add(
          new MomInboxItem(
              "PULSE",
              c.getId(),
              c.getSender() != null ? c.getSender().getName() : "Family",
              c.getMessage(),
              c.getSentAt().atOffset(ZoneOffset.UTC).toString(),
              null));
    }
    items.sort(Comparator.comparing(MomInboxItem::date).reversed());
    return items;
  }

  /** ML risk preview for family when mom's patterns suggest HIGH risk and privacy allows sharing. */
  public Map<String, Object> momMlRiskForFamily(User familyUser) {
    if (familyUser.getRole() != Role.FAMILY || familyUser.getLinkedMother() == null) {
      return Map.of("showAlert", false, "risk_level", "LOW");
    }
    User mother = requireMother(familyUser);
    PrivacySettings p = privacy(mother);
    if (p.getPrivacyLevel() == PrivacyLevel.PRIVATE
        || !Boolean.TRUE.equals(p.getShareMood())) {
      return Map.of(
          "showAlert",
          false,
          "risk_level",
          "UNKNOWN",
          "prediction_message",
          "");
    }

    List<DailyEntry> entries =
        dailyEntryRepository.findTop30ByUserIdOrderByEntryDateDesc(mother.getId());
    List<Map<String, Object>> history = new ArrayList<>();
    for (DailyEntry e : entries) {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("entry_date", e.getEntryDate().toString());
      row.put("sleep_quality", e.getSleepQuality() != null ? e.getSleepQuality().name() : "OKAY");
      row.put("activity", e.getActivity() != null ? e.getActivity().name() : "RESTED");
      row.put("diet", e.getDiet() != null ? e.getDiet().name() : "NORMAL");
      row.put("mood", e.getMood() != null ? e.getMood().name() : "NEUTRAL");
      history.add(row);
    }

    Map<String, Object> pred = mlService.predictRisk(mother.getId(), history);
    boolean show = "HIGH".equals(pred.get("risk_level"));
    String msg =
        show
            ? "Your mom might need extra support this week 💕 A gentle check-in could mean a lot."
            : "";
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("showAlert", show);
    out.put("risk_prediction", pred);
    out.put("message", msg);
    return out;
  }

  private static String truncate(String s, int max) {
    if (s == null) {
      return "";
    }
    return s.length() <= max ? s : s.substring(0, max) + "…";
  }

  private static double moodScore(MoodType m) {
    return switch (m) {
      case HAPPY, CALM -> 4;
      case NEUTRAL -> 2;
      case SAD, STRESSED, TIRED -> 1;
    };
  }

  private static String moodEmoji(MoodType mood) {
    if (mood == null) {
      return "\uD83C\uDF3F";
    }
    return switch (mood) {
      case HAPPY -> "\uD83D\uDE0A";
      case CALM -> "\uD83D\uDE0C";
      case NEUTRAL -> "\uD83D\uDE10";
      case SAD -> "\uD83D\uDE14";
      case STRESSED -> "\uD83D\uDE28";
      case TIRED -> "\uD83D\uDE34";
    };
  }
}
