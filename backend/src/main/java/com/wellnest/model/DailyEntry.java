package com.wellnest.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
    name = "daily_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "entry_date"}))
public class DailyEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "entry_date", nullable = false)
  private LocalDate entryDate;

  @Enumerated(EnumType.STRING)
  private SleepQuality sleepQuality;

  @Enumerated(EnumType.STRING)
  private ActivityLevel activity;

  @Enumerated(EnumType.STRING)
  private DietLevel diet;

  @Enumerated(EnumType.STRING)
  private MoodType mood;

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(name = "bert_detected_emotion", length = 32)
  private String bertDetectedEmotion;

  @Column(name = "bert_confidence")
  private Double bertConfidence;

  @Column(name = "bert_conflicts_with_manual")
  private Boolean bertConflictsWithManual;

  @Column(name = "bert_nesti_message", columnDefinition = "TEXT")
  private String bertNestiMessage;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  public DailyEntry() {}

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

  public LocalDate getEntryDate() {
    return entryDate;
  }

  public void setEntryDate(LocalDate entryDate) {
    this.entryDate = entryDate;
  }

  public SleepQuality getSleepQuality() {
    return sleepQuality;
  }

  public void setSleepQuality(SleepQuality sleepQuality) {
    this.sleepQuality = sleepQuality;
  }

  public ActivityLevel getActivity() {
    return activity;
  }

  public void setActivity(ActivityLevel activity) {
    this.activity = activity;
  }

  public DietLevel getDiet() {
    return diet;
  }

  public void setDiet(DietLevel diet) {
    this.diet = diet;
  }

  public MoodType getMood() {
    return mood;
  }

  public void setMood(MoodType mood) {
    this.mood = mood;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public String getBertDetectedEmotion() {
    return bertDetectedEmotion;
  }

  public void setBertDetectedEmotion(String bertDetectedEmotion) {
    this.bertDetectedEmotion = bertDetectedEmotion;
  }

  public Double getBertConfidence() {
    return bertConfidence;
  }

  public void setBertConfidence(Double bertConfidence) {
    this.bertConfidence = bertConfidence;
  }

  public Boolean getBertConflictsWithManual() {
    return bertConflictsWithManual;
  }

  public void setBertConflictsWithManual(Boolean bertConflictsWithManual) {
    this.bertConflictsWithManual = bertConflictsWithManual;
  }

  public String getBertNestiMessage() {
    return bertNestiMessage;
  }

  public void setBertNestiMessage(String bertNestiMessage) {
    this.bertNestiMessage = bertNestiMessage;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  @PrePersist
  public void prePersist() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
