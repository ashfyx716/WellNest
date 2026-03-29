package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.*;
import com.wellnest.model.*;
import com.wellnest.repository.CarePulseRepository;
import com.wellnest.repository.DailyEntryRepository;
import com.wellnest.util.StreakUtil;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class JourneyService {

  private final DailyEntryRepository dailyEntryRepository;
  private final CarePulseRepository carePulseRepository;

  public JourneyService(
      DailyEntryRepository dailyEntryRepository, CarePulseRepository carePulseRepository) {
    this.dailyEntryRepository = dailyEntryRepository;
    this.carePulseRepository = carePulseRepository;
  }

  public TreeStatusResponse treeStatus(User user) {
    LocalDate to = LocalDate.now();
    LocalDate from = to.minusDays(6);
    List<DailyEntry> week =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), from, to);
    List<LocalDate> allDates =
        dailyEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId()).stream()
            .map(DailyEntry::getEntryDate)
            .collect(Collectors.toList());
    int streak = StreakUtil.computeStreak(allDates, to);

    int score = 50;
    if (week.isEmpty()) {
      return new TreeStatusResponse(15, streak, "bare");
    }
    long stressed =
        week.stream()
            .filter(
                e ->
                    e.getMood() == MoodType.STRESSED
                        || e.getMood() == MoodType.SAD
                        || e.getSleepQuality() == SleepQuality.POOR)
            .count();
    long good =
        week.stream()
            .filter(
                e ->
                    e.getMood() == MoodType.HAPPY
                        || e.getMood() == MoodType.CALM
                        || e.getSleepQuality() == SleepQuality.GOOD)
            .count();
    if (stressed >= 4) {
      score = 35;
    } else if (good >= 5) {
      score = 95;
    } else if (good >= 3) {
      score = 72;
    } else {
      score = 55;
    }
    String narrative =
        score >= 80 ? "lush" : score >= 50 ? "mixed" : score >= 35 ? "stressed-week" : "bare";
    return new TreeStatusResponse(score, streak, narrative);
  }

  public JourneyCalendarResponse calendar(User user, int days) {
    LocalDate end = LocalDate.now();
    LocalDate start = end.minusDays(days - 1L);
    List<DailyEntry> entries =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), start, end);
    Map<LocalDate, DailyEntry> map =
        entries.stream().collect(Collectors.toMap(DailyEntry::getEntryDate, e -> e));
    List<CalendarDay> list = new ArrayList<>();
    for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
      DailyEntry e = map.get(d);
      if (e != null && e.getMood() != null) {
        list.add(new CalendarDay(d, e.getMood().name(), e.getMood(), true));
      } else {
        list.add(new CalendarDay(d, "NONE", null, false));
      }
    }
    return new JourneyCalendarResponse(list);
  }

  public JourneyChartsResponse charts(User user) {
    LocalDate to = LocalDate.now();
    LocalDate from7 = to.minusDays(6);
    List<DailyEntry> week =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), from7, to);
    Map<LocalDate, DailyEntry> wmap =
        week.stream().collect(Collectors.toMap(DailyEntry::getEntryDate, e -> e));
    List<ChartPoint> sleepPts = new ArrayList<>();
    for (LocalDate d = from7; !d.isAfter(to); d = d.plusDays(1)) {
      DailyEntry e = wmap.get(d);
      int v = 0;
      if (e != null && e.getSleepQuality() != null) {
        v =
            switch (e.getSleepQuality()) {
              case GOOD -> 3;
              case OKAY -> 2;
              case POOR -> 1;
            };
      }
      sleepPts.add(new ChartPoint(d.getDayOfMonth() + "", v));
    }

    LocalDate from30 = to.minusDays(29);
    List<DailyEntry> month =
        dailyEntryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
            user.getId(), from30, to);
    Map<LocalDate, DailyEntry> mmap =
        month.stream().collect(Collectors.toMap(DailyEntry::getEntryDate, e -> e));
    List<ChartPoint> moodPts = new ArrayList<>();
    for (LocalDate d = from30; !d.isAfter(to); d = d.plusDays(1)) {
      DailyEntry e = mmap.get(d);
      int v = 0;
      if (e != null && e.getMood() != null) {
        v =
            switch (e.getMood()) {
              case HAPPY, CALM -> 4;
              case NEUTRAL -> 2;
              case SAD, STRESSED, TIRED -> 1;
            };
      }
      moodPts.add(new ChartPoint(d.format(DateTimeFormatter.ISO_LOCAL_DATE), v));
    }

    long active =
        month.stream()
            .filter(
                e ->
                    e.getActivity() == ActivityLevel.WALKED
                        || e.getActivity() == ActivityLevel.YOGA)
            .count();
    double pct =
        month.isEmpty() ? 0 : Math.round((active * 100.0) / month.size() * 10) / 10.0;

    return new JourneyChartsResponse(sleepPts, moodPts, pct);
  }

  public JourneyBadgesResponse badges(User user) {
    List<DailyEntry> all =
        dailyEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId());
    List<BadgeItem> items = new ArrayList<>();

    items.add(
        badgeEarlyRiser(all));
    items.add(badgeNourished(all));
    items.add(badgeStepQueen(all));
    items.add(badgeInnerPeace(all));
    items.add(badgeLoved(user));
    items.add(badgeOnFire(all, user.getId()));

    return new JourneyBadgesResponse(items);
  }

  private BadgeItem badgeEarlyRiser(List<DailyEntry> all) {
    int run = 0;
    int max = 0;
    List<DailyEntry> asc =
        new ArrayList<>(all);
    asc.sort(Comparator.comparing(DailyEntry::getEntryDate));
    for (DailyEntry e : asc) {
      if (e.getSleepQuality() == SleepQuality.GOOD) {
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }
    boolean earned = max >= 5;
    int prog = earned ? 100 : Math.min(100, (max * 100) / 5);
    return new BadgeItem(
        "early_riser",
        "Early Riser",
        "\uD83C\uDF05",
        earned,
        prog,
        "Good sleep 5 days in a row.");
  }

  private BadgeItem badgeNourished(List<DailyEntry> all) {
    int run = 0;
    int max = 0;
    List<DailyEntry> asc = new ArrayList<>(all);
    asc.sort(Comparator.comparing(DailyEntry::getEntryDate));
    for (DailyEntry e : asc) {
      if (e.getDiet() == DietLevel.HEALTHY) {
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }
    boolean earned = max >= 7;
    int prog = earned ? 100 : Math.min(100, (max * 100) / 7);
    return new BadgeItem(
        "nourished", "Nourished", "\uD83E\uDD57", earned, prog, "Healthy diet 7 days straight.");
  }

  private BadgeItem badgeStepQueen(List<DailyEntry> all) {
    int run = 0;
    int max = 0;
    List<DailyEntry> asc = new ArrayList<>(all);
    asc.sort(Comparator.comparing(DailyEntry::getEntryDate));
    for (DailyEntry e : asc) {
      if (e.getActivity() == ActivityLevel.WALKED || e.getActivity() == ActivityLevel.YOGA) {
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }
    boolean earned = max >= 10;
    int prog = earned ? 100 : Math.min(100, (max * 100) / 10);
    return new BadgeItem(
        "step_queen", "Step Queen", "\uD83D\uDEB6\u200D\u2640\uFE0F", earned, prog, "Active 10 days in a row.");
  }

  private BadgeItem badgeInnerPeace(List<DailyEntry> all) {
    int run = 0;
    int max = 0;
    List<DailyEntry> asc = new ArrayList<>(all);
    asc.sort(Comparator.comparing(DailyEntry::getEntryDate));
    for (DailyEntry e : asc) {
      if (e.getMood() == MoodType.HAPPY || e.getMood() == MoodType.CALM) {
        run++;
        max = Math.max(max, run);
      } else {
        run = 0;
      }
    }
    boolean earned = max >= 7;
    int prog = earned ? 100 : Math.min(100, (max * 100) / 7);
    return new BadgeItem(
        "inner_peace", "Inner Peace", "\uD83E\uDDD8\u200D\u2640\uFE0F", earned, prog, "Positive mood 7 days.");
  }

  private BadgeItem badgeLoved(User user) {
    long count = carePulseRepository.findByReceiverIdOrderBySentAtDesc(user.getId()).size();
    boolean earned = count >= 10;
    int prog = earned ? 100 : Math.min(100, (int) ((count * 100) / 10));
    return new BadgeItem(
        "loved", "Loved", "\uD83D\uDC8C", earned, prog, "Receive 10 care pulses.");
  }

  private BadgeItem badgeOnFire(List<DailyEntry> all, Long userId) {
    List<LocalDate> dates = all.stream().map(DailyEntry::getEntryDate).collect(Collectors.toList());
    int streak = StreakUtil.computeStreak(dates, LocalDate.now());
    boolean earned = streak >= 21;
    int prog = earned ? 100 : Math.min(100, (streak * 100) / 21);
    return new BadgeItem(
        "on_fire", "On Fire", "\uD83D\uDD25", earned, prog, "21-day streak.");
  }

  public List<MilestoneItem> milestones(User user) {
    List<MilestoneItem> m = new ArrayList<>();
    List<DailyEntry> asc =
        dailyEntryRepository.findByUserIdOrderByEntryDateDesc(user.getId()).stream()
            .sorted(Comparator.comparing(DailyEntry::getEntryDate))
            .collect(Collectors.toList());
    if (!asc.isEmpty()) {
      DailyEntry first = asc.get(0);
      m.add(
          new MilestoneItem(
              first.getEntryDate().toString(),
              "First ritual",
              "You began your journey \uD83C\uDF31"));
    }
    TreeStatusResponse tree = treeStatus(user);
    if (tree.streak() >= 7) {
      m.add(
          new MilestoneItem(
              LocalDate.now().toString(),
              "Week of care",
              "Seven days of showing up for yourself."));
    }
    return m;
  }
}
