package com.wellnest.repository;

import com.wellnest.model.VoiceHug;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoiceHugRepository extends JpaRepository<VoiceHug, Long> {
  List<VoiceHug> findByReceiverIdOrderBySentAtDesc(Long receiverId);

  List<VoiceHug> findBySenderIdOrderBySentAtDesc(Long senderId);
}
