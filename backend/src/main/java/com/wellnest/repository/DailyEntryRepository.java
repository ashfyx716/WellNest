package com.wellnest.repository;

import com.wellnest.model.DailyEntry;
import com.wellnest.model.User;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyEntryRepository extends JpaRepository<DailyEntry, Long> {
  Optional<DailyEntry> findByUserAndEntryDate(User user, LocalDate date);

  List<DailyEntry> findByUserIdOrderByEntryDateDesc(Long userId);

  List<DailyEntry> findTop7ByUserIdOrderByEntryDateDesc(Long userId);

  List<DailyEntry> findTop30ByUserIdOrderByEntryDateDesc(Long userId);

  List<DailyEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
      Long userId, LocalDate from, LocalDate to);
}
