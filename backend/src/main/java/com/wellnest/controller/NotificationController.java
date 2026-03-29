package com.wellnest.controller;

import com.wellnest.service.AuthFacade;
import com.wellnest.service.NotificationService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationService notificationService;
  private final AuthFacade authFacade;

  public NotificationController(
      NotificationService notificationService, AuthFacade authFacade) {
    this.notificationService = notificationService;
    this.authFacade = authFacade;
  }

  @GetMapping("/all")
  public Object all() {
    return notificationService.all(authFacade.requireUser());
  }

  @PatchMapping("/read/{id}")
  public Map<String, String> markRead(@PathVariable Long id) {
    notificationService.markRead(authFacade.requireUser(), id);
    return Map.of("status", "ok");
  }

  public record SendBody(String type, String title, String message) {}

  /** Sends a notification to the authenticated user (testing / internal flows). */
  @PostMapping("/send")
  public Map<String, Long> send(@RequestBody SendBody body) {
    var user = authFacade.requireUser();
    var n =
        notificationService.create(
            user.getId(),
            body.type() != null ? body.type() : "GENERAL",
            body.title() != null ? body.title() : "WellNest",
            body.message() != null ? body.message() : "");
    return Map.of("id", n.getId());
  }
}
