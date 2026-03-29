package com.wellnest.repository;

import com.wellnest.model.LoveNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoveNoteRepository extends JpaRepository<LoveNote, Long> {
  List<LoveNote> findByReceiverIdOrderBySentAtDesc(Long receiverId);

  List<LoveNote> findBySenderIdOrderBySentAtDesc(Long senderId);
}
