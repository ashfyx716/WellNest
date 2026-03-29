package com.wellnest.controller;

import com.wellnest.model.VoiceHug;
import com.wellnest.model.User;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.FamilyService;
import java.io.File;
import java.nio.file.Files;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/voice-hug")
public class VoiceHugController {

  private final FamilyService familyService;
  private final AuthFacade authFacade;

  @Value("${wellnest.upload.dir:uploads}")
  private String uploadDir;

  public VoiceHugController(FamilyService familyService, AuthFacade authFacade) {
    this.familyService = familyService;
    this.authFacade = authFacade;
  }

  @PostMapping("/send")
  public Map<String, Object> send(
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "durationSeconds", defaultValue = "0") int durationSeconds)
      throws Exception {
    VoiceHug hug = familyService.sendVoiceHug(authFacade.requireUser(), file, durationSeconds);
    return Map.of(
        "id",
        hug.getId(),
        "audioUrl",
        hug.getAudioUrl(),
        "sentAt",
        hug.getSentAt().atOffset(ZoneOffset.UTC).toString());
  }

  @GetMapping("/history")
  public List<Map<String, Object>> history() {
    User u = authFacade.requireUser();
    return familyService.voiceHugHistory(u).stream()
        .map(
            v -> {
              Map<String, Object> item =
                  Map.of(
                      "id",
                      v.getId(),
                      "audioUrl",
                      v.getAudioUrl() != null ? v.getAudioUrl() : "",
                      "durationSeconds",
                      v.getDurationSeconds() != null ? v.getDurationSeconds() : 0,
                      "sentAt",
                      v.getSentAt().atOffset(ZoneOffset.UTC).toString());
              return item;
            })
        .toList();
  }

  @GetMapping("/{id}/download")
  public ResponseEntity<byte[]> downloadAudio(@PathVariable Long id) throws Exception {
    authFacade.requireUser(); // Ensure user is authenticated
    VoiceHug voiceHug = familyService.getVoiceHug(id);
    
    if (voiceHug == null) {
      return ResponseEntity.notFound().build();
    }

    String audioPath = voiceHug.getAudioUrl();
    if (audioPath == null || audioPath.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    // Parse the filename from the audioUrl (e.g., /uploads/voices/uuid_filename.webm)
    String filename = audioPath.substring(audioPath.lastIndexOf('/') + 1);
    File audioFile = new File(uploadDir + "/voices/" + filename);

    if (!audioFile.exists()) {
      return ResponseEntity.notFound().build();
    }

    byte[] audioBytes = Files.readAllBytes(audioFile.toPath());
    String mediaType = filename.endsWith(".mp3") ? "audio/mpeg" : "audio/webm";

    return ResponseEntity.ok()
        .header("Content-Type", mediaType)
        .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
        .body(audioBytes);
  }
}
