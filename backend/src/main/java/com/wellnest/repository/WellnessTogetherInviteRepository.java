package com.wellnest.repository;

import com.wellnest.model.WellnessTogetherInvite;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WellnessTogetherInviteRepository extends JpaRepository<WellnessTogetherInvite, Long> {
  List<WellnessTogetherInvite> findByInviteeIdOrderBySentAtDesc(Long inviteeId);
}
