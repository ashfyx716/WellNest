package com.wellnest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.wellnest.model.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class WellnessDtos {

  private WellnessDtos() {}

  public record DailyEntryRequest(
      SleepQuality sleepQuality,
      ActivityLevel activity,
      DietLevel diet,
      MoodType mood,
      String notes) {}

  public record DailyEntryResponse(
      Long id,
      LocalDate entryDate,
      SleepQuality sleepQuality,
      ActivityLevel activity,
      DietLevel diet,
      MoodType mood,
      String notes,
      String bertDetectedEmotion,
      Double bertConfidence,
      Boolean bertConflictsWithManual,
      String bertNestiMessage) {}

  public record SaveCheckinResponse(
      DailyEntryResponse entry,
      @JsonProperty("bert_result") Map<String, Object> bertResult) {}

  public record EmotionDayItem(
      LocalDate date, String emotion, Double confidence, String nestiMessage) {}

  public record InsightResponse(String insight) {}

  public record DashboardSummaryResponse(
      int streak,
      MoodType moodAura,
      boolean sleepLogged,
      boolean moodLogged,
      boolean activityLogged,
      boolean dietLogged,
      MoodType todayMood,
      String nestiStatus,
      DailyEntryResponse todayEntry) {}

  public record CarePulseResponse(Long id, String message, String sentAt, boolean read) {}

  public record TreeStatusResponse(int healthScore, int streak, String narrative) {}

  public record CalendarDay(LocalDate date, String moodKey, MoodType mood, boolean hasEntry) {}

  public record JourneyCalendarResponse(List<CalendarDay> days) {}

  public record ChartPoint(String label, Integer value) {}

  public record JourneyChartsResponse(
      List<ChartPoint> sleepLast7,
      List<ChartPoint> moodLast30,
      double activityPercentActive) {}

  public record BadgeItem(
      String id,
      String title,
      String emoji,
      boolean earned,
      int progressPercent,
      String description) {}

  public record JourneyBadgesResponse(List<BadgeItem> badges) {}

  public record MilestoneItem(String date, String title, String description) {}

  public record MomSummaryResponse(
      String moodEmoji,
      String moodLabel,
      List<Double> last7Scores,
      String statusMessage,
      String statusTone) {}

  public record CareRecommendation(
      String title,
      String description,
      String emoji,
      String actionType) {}

  public record MomCareGuideResponse(
      String moodEmoji,
      String moodLabel,
      String wellnessLevel,
      String moodTrend,
      String trendDescription,
      List<String> doDos,
      List<String> dontDos,
      List<CareRecommendation> suggestions,
      String personalCareTip) {}

  public record PrivacyResponse(
      PrivacyLevel privacyLevel,
      boolean shareMood,
      boolean shareSleep,
      boolean shareActivity,
      boolean shareCalendar,
      boolean allowGoals,
      boolean allowVoice) {}

  public record PrivacyUpdateRequest(
      PrivacyLevel privacyLevel,
      Boolean shareMood,
      Boolean shareSleep,
      Boolean shareActivity,
      Boolean shareCalendar,
      Boolean allowGoals,
      Boolean allowVoice) {}

  public record NotificationItem(
      Long id, String type, String title, String message, boolean read, String createdAt) {}

  public record ChatRequest(String message) {}

  public record ChatResponse(String reply) {}

  public record ChatMessageItem(String role, String content, String timestamp) {}

  public record ReportWeeklyResponse(
      double avgSleepScore,
      Map<String, Long> moodCounts,
      int activeDays,
      int totalDays) {}

  public record ReportMonthlyResponse(List<ChartPoint> moodTrend) {}

  public record LinkMotherRequest(String motherEmail) {}

  public record CarePulseSendRequest(String message) {}

  public record GentleGoalRequest(String goalText) {}

  public record WellnessTogetherRequest(String message) {}

  public record LoveNoteRequest(String content) {}

  public record ArchiveItem(
      String kind, Long id, String preview, String date, String audioUrl) {}

  public record MomInboxItem(
      String kind,
      Long id,
      String senderName,
      String content,
      String date,
      String audioUrl) {}
}
