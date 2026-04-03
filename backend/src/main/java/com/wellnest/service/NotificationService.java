package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.NotificationItem;
import com.wellnest.model.AppNotification;
import com.wellnest.model.User;
import com.wellnest.repository.AppNotificationRepository;
import com.wellnest.repository.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

  private final AppNotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final SimpMessagingTemplate messagingTemplate;

  public NotificationService(
      AppNotificationRepository notificationRepository,
      UserRepository userRepository,
      SimpMessagingTemplate messagingTemplate) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
    this.messagingTemplate = messagingTemplate;
  }

  @Transactional
  public AppNotification create(Long userId, String type, String title, String message) {
    User u = userRepository.findById(userId).orElseThrow();
    AppNotification n = new AppNotification();
    n.setUser(u);
    n.setType(type);
    n.setTitle(title);
    n.setMessage(message);
    n = notificationRepository.save(n);
    Map<String, Object> payload = new HashMap<>();
    payload.put("id", n.getId());
    payload.put("type", type);
    payload.put("title", title);
    payload.put("message", message);
    messagingTemplate.convertAndSend("/topic/notifications/" + userId, payload);
    return n;
  }

  public List<NotificationItem> all(User user) {
    return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
        .map(
            n ->
                new NotificationItem(
                    n.getId(),
                    n.getType(),
                    n.getTitle(),
                    n.getMessage(),
                    Boolean.TRUE.equals(n.getReadFlag()),
                    n.getCreatedAt().atOffset(ZoneOffset.UTC).toString()))
        .toList();
  }

  @Transactional
  public void markRead(User user, Long id) {
    AppNotification n =
        notificationRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Not found"));
    if (!n.getUser().getId().equals(user.getId())) {
      throw new IllegalArgumentException("Forbidden");
    }
    n.setReadFlag(true);
    notificationRepository.save(n);
  }

  public boolean hasRecentByType(Long userId, String type, Duration within) {
    if (userId == null || type == null || type.isBlank() || within == null || within.isNegative()) {
      return false;
    }
    Instant cutoff = Instant.now().minus(within);
    return notificationRepository.existsByUserIdAndTypeAndCreatedAtAfter(userId, type, cutoff);
  }
}
