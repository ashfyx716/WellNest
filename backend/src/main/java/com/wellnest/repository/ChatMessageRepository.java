package com.wellnest.repository;

import com.wellnest.model.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
  List<ChatMessage> findByUserIdOrderByTimestampAsc(Long userId);

  List<ChatMessage> findTop10ByUserIdOrderByTimestampDesc(Long userId);

  void deleteByUserId(Long userId);
}
