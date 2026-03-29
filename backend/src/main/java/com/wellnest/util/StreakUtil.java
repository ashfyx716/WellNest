package com.wellnest.util;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class StreakUtil {

  private StreakUtil() {}

  /** Consecutive days with entries, counting backwards from today or yesterday. */
  public static int computeStreak(List<LocalDate> sortedDescDates, LocalDate today) {
    if (sortedDescDates == null || sortedDescDates.isEmpty()) {
      return 0;
    }
    Set<LocalDate> set = new HashSet<>(sortedDescDates);
    LocalDate cursor = today;
    if (!set.contains(today)) {
      if (set.contains(today.minusDays(1))) {
        cursor = today.minusDays(1);
      } else {
        return 0;
      }
    }
    int streak = 0;
    while (set.contains(cursor)) {
      streak++;
      cursor = cursor.minusDays(1);
    }
    return streak;
  }
}
