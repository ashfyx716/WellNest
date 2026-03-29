package com.wellnest.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "wellness_together_invites")
public class WellnessTogetherInvite {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "inviter_id", nullable = false)
  private User inviter;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "invitee_id", nullable = false)
  private User invitee;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(name = "sent_at", nullable = false)
  private Instant sentAt;

  public WellnessTogetherInvite() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getInviter() {
    return inviter;
  }

  public void setInviter(User inviter) {
    this.inviter = inviter;
  }

  public User getInvitee() {
    return invitee;
  }

  public void setInvitee(User invitee) {
    this.invitee = invitee;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Instant getSentAt() {
    return sentAt;
  }

  public void setSentAt(Instant sentAt) {
    this.sentAt = sentAt;
  }

  @PrePersist
  public void prePersist() {
    if (sentAt == null) {
      sentAt = Instant.now();
    }
  }
}
