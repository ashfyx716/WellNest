package com.wellnest.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "gentle_goals")
public class GentleGoal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "assigned_by", nullable = false)
  private User assignedBy;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "assigned_to", nullable = false)
  private User assignedTo;

  @Column(name = "goal_text", nullable = false, columnDefinition = "TEXT")
  private String goalText;

  @Column(name = "assigned_at", nullable = false)
  private Instant assignedAt;

  @Column(name = "is_completed", nullable = false)
  private Boolean completed = false;

  public GentleGoal() {}

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getAssignedBy() {
    return assignedBy;
  }

  public void setAssignedBy(User assignedBy) {
    this.assignedBy = assignedBy;
  }

  public User getAssignedTo() {
    return assignedTo;
  }

  public void setAssignedTo(User assignedTo) {
    this.assignedTo = assignedTo;
  }

  public String getGoalText() {
    return goalText;
  }

  public void setGoalText(String goalText) {
    this.goalText = goalText;
  }

  public Instant getAssignedAt() {
    return assignedAt;
  }

  public void setAssignedAt(Instant assignedAt) {
    this.assignedAt = assignedAt;
  }

  public Boolean getCompleted() {
    return completed;
  }

  public void setCompleted(Boolean completed) {
    this.completed = completed;
  }

  @PrePersist
  public void prePersist() {
    if (assignedAt == null) {
      assignedAt = Instant.now();
    }
    if (completed == null) {
      completed = false;
    }
  }
}
