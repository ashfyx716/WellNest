package com.wellnest.service;

import com.wellnest.dto.WellnessDtos.PrivacyResponse;
import com.wellnest.dto.WellnessDtos.PrivacyUpdateRequest;
import com.wellnest.model.PrivacySettings;
import com.wellnest.model.User;
import com.wellnest.repository.PrivacySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrivacyService {

  private final PrivacySettingsRepository privacySettingsRepository;

  public PrivacyService(PrivacySettingsRepository privacySettingsRepository) {
    this.privacySettingsRepository = privacySettingsRepository;
  }

  public PrivacyResponse get(User user) {
    PrivacySettings p = getOrCreate(user);
    return new PrivacyResponse(
        p.getPrivacyLevel(),
        p.getShareMood(),
        p.getShareSleep(),
        p.getShareActivity(),
        p.getShareCalendar(),
        p.getAllowGoals(),
        p.getAllowVoice());
  }

  @Transactional
  public PrivacyResponse update(User user, PrivacyUpdateRequest req) {
    PrivacySettings p = getOrCreate(user);
    if (req.privacyLevel() != null) {
      p.setPrivacyLevel(req.privacyLevel());
    }
    if (req.shareMood() != null) {
      p.setShareMood(req.shareMood());
    }
    if (req.shareSleep() != null) {
      p.setShareSleep(req.shareSleep());
    }
    if (req.shareActivity() != null) {
      p.setShareActivity(req.shareActivity());
    }
    if (req.shareCalendar() != null) {
      p.setShareCalendar(req.shareCalendar());
    }
    if (req.allowGoals() != null) {
      p.setAllowGoals(req.allowGoals());
    }
    if (req.allowVoice() != null) {
      p.setAllowVoice(req.allowVoice());
    }
    privacySettingsRepository.save(p);
    return get(user);
  }

  private PrivacySettings getOrCreate(User user) {
    return privacySettingsRepository
        .findByUserId(user.getId())
        .orElseGet(
            () -> {
              PrivacySettings created = new PrivacySettings();
              created.setUser(user);
              return privacySettingsRepository.save(created);
            });
  }
}
