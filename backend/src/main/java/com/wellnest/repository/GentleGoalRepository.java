package com.wellnest.repository;

import com.wellnest.model.GentleGoal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GentleGoalRepository extends JpaRepository<GentleGoal, Long> {
  List<GentleGoal> findByAssignedToIdAndCompletedFalseOrderByAssignedAtDesc(Long userId);

  long countByAssignedToIdAndCompletedFalse(Long userId);
}
