package com.wellnest.repository;

import com.wellnest.model.PrivacySettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings, Long> {
  Optional<PrivacySettings> findByUserId(Long userId);
}
