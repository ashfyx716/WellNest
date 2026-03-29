package com.wellnest.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "love_notes")
public class LoveNote {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "receiver_id", nullable = false)
  private User receiver;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "sent_at", nullable = false)
  private Instant sentAt;

  @Column(name = "is_read", nullable = false)
  private Boolean readFlag = false;

  public LoveNote() {}

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

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
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
