package com.wellnest.model;

import jakarta.persistence.*;

@Entity
@Table(name = "privacy_settings")
public class PrivacySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "privacy_level", nullable = false, length = 20)
  private PrivacyLevel privacyLevel = PrivacyLevel.FULL;

  @Column(name = "share_mood", nullable = false)
  private Boolean shareMood = true;

  @Column(name = "share_sleep", nullable = false)
  private Boolean shareSleep = true;

  @Column(name = "share_activity", nullable = false)
  private Boolean shareActivity = true;

  @Column(name = "share_calendar", nullable = false)
  private Boolean shareCalendar = true;

  @Column(name = "allow_goals", nullable = false)
  private Boolean allowGoals = true;

  @Column(name = "allow_voice", nullable = false)
  private Boolean allowVoice = true;

  public PrivacySettings() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public PrivacyLevel getPrivacyLevel() {
    return privacyLevel;
  }

  public void setPrivacyLevel(PrivacyLevel privacyLevel) {
    this.privacyLevel = privacyLevel;
  }

  public Boolean getShareMood() {
    return shareMood;
  }

  public void setShareMood(Boolean shareMood) {
    this.shareMood = shareMood;
  }

  public Boolean getShareSleep() {
    return shareSleep;
  }

  public void setShareSleep(Boolean shareSleep) {
    this.shareSleep = shareSleep;
  }

  public Boolean getShareActivity() {
    return shareActivity;
  }

  public void setShareActivity(Boolean shareActivity) {
    this.shareActivity = shareActivity;
  }

  public Boolean getShareCalendar() {
    return shareCalendar;
  }

  public void setShareCalendar(Boolean shareCalendar) {
    this.shareCalendar = shareCalendar;
  }

  public Boolean getAllowGoals() {
    return allowGoals;
  }

  public void setAllowGoals(Boolean allowGoals) {
    this.allowGoals = allowGoals;
  }

  public Boolean getAllowVoice() {
    return allowVoice;
  }

  public void setAllowVoice(Boolean allowVoice) {
    this.allowVoice = allowVoice;
  }
}
