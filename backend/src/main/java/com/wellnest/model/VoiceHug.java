package com.wellnest.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "voice_hugs")
public class VoiceHug {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "receiver_id", nullable = false)
  private User receiver;

  @Column(name = "audio_url", length = 500)
  private String audioUrl;

  @Column(name = "duration_seconds")
  private Integer durationSeconds;

  @Column(name = "sent_at", nullable = false)
  private Instant sentAt;

  @Column(name = "is_read", nullable = false)
  private Boolean readFlag = false;

  public VoiceHug() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getSender() {
    return sender;
  }

  public void setSender(User sender) {
    this.sender = sender;
  }

  public User getReceiver() {
    return receiver;
  }

  public void setReceiver(User receiver) {
    this.receiver = receiver;
  }

  public String getAudioUrl() {
    return audioUrl;
  }

  public void setAudioUrl(String audioUrl) {
    this.audioUrl = audioUrl;
  }

  public Integer getDurationSeconds() {
    return durationSeconds;
  }

  public void setDurationSeconds(Integer durationSeconds) {
    this.durationSeconds = durationSeconds;
  }

  public Instant getSentAt() {
    return sentAt;
  }

  public void setSentAt(Instant sentAt) {
    this.sentAt = sentAt;
  }

  public Boolean getReadFlag() {
    return readFlag;
  }

  public void setReadFlag(Boolean readFlag) {
    this.readFlag = readFlag;
  }

  @PrePersist
  public void prePersist() {
    if (sentAt == null) {
      sentAt = Instant.now();
    }
    if (readFlag == null) {
      readFlag = false;
    }
  }
}
