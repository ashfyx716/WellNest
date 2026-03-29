package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.CarePulseResponse;
import com.wellnest.dto.WellnessDtos.DailyEntryResponse;
import com.wellnest.dto.WellnessDtos.DashboardSummaryResponse;
import com.wellnest.model.DailyEntry;
import com.wellnest.model.MoodType;
import com.wellnest.model.User;
import com.wellnest.repository.CarePulseRepository;
import com.wellnest.repository.DailyEntryRepository;
import com.wellnest.util.StreakUtil;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

  private final DailyEntryRepository dailyEntryRepository;
  private final CarePulseRepository carePulseRepository;
  private final OpenAiClient openAiClient;
  private final CheckinService checkinService;

  public DashboardService(
      DailyEntryRepository dailyEntryRepository,
      CarePulseRepository carePulseRepository,
      OpenAiClient openAiClient,
      CheckinService checkinService) {
    this.dailyEntryRepository = dailyEntryRepository;
    this.carePulseRepository = carePulseRepository;
    this.openAiClient = openAiClient;
    this.checkinService = checkinService;
  }

  public DashboardSummaryResponse summary(User user) {
    LocalDate today = LocalDate.now();
    List<LocalDate> dates =
        dailyEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId()).stream()
            .map(DailyEntry::getEntryDate)
            .collect(Collectors.toList());
    int streak = StreakUtil.computeStreak(dates, today);

    var entryOpt = dailyEntryRepository.findByUserAndEntryDate(user, today);
    MoodType aura = checkinService.latestMoodAura(user);
    DailyEntryResponse todayDto =
        entryOpt.map(this::toResponse).orElse(null);
    boolean sleep = entryOpt.map(e -> e.getSleepQuality() != null).orElse(false);
    boolean mood = entryOpt.map(e -> e.getMood() != null).orElse(false);
    boolean act = entryOpt.map(e -> e.getActivity() != null).orElse(false);
    boolean diet = entryOpt.map(e -> e.getDiet() != null).orElse(false);
    MoodType tm =
        entryOpt.map(DailyEntry::getMood).orElse(MoodType.NEUTRAL);
    String status =
        entryOpt
            .map(
                e ->
                    "You're tending to yourself beautifully today 🌿")
            .orElse("Your circle is waiting — a gentle check-in when you can.");

    return new DashboardSummaryResponse(
        streak, aura, sleep, mood, act, diet, tm, status, todayDto);
  }

  public String suggestion(User user) {
    String ctx = checkinService.wellnessContextBlock(user);
    String sys =
        "You are Nesti. Give one short gentle daily wellness suggestion (2 sentences) "
            + "based on this recent data. Middle-aged Indian women audience. No medical advice.";
    return openAiClient.chat(sys, ctx);
  }

  public CarePulseResponse latestCarePulse(User user) {
    return carePulseRepository.findByReceiverIdOrderBySentAtDesc(user.getId()).stream()
        .findFirst()
        .map(
            c ->
                new CarePulseResponse(
                    c.getId(),
                    c.getMessage(),
                    c.getSentAt().atOffset(ZoneOffset.UTC).toString(),
                    Boolean.TRUE.equals(c.getReadFlag())))
        .orElse(null);
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
}
