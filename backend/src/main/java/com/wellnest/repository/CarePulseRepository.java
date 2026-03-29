package com.wellnest.repository;

import com.wellnest.model.CarePulse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarePulseRepository extends JpaRepository<CarePulse, Long> {
  List<CarePulse> findByReceiverIdOrderBySentAtDesc(Long receiverId);

  List<CarePulse> findBySenderIdOrderBySentAtDesc(Long senderId);

  List<CarePulse> findByReceiverIdAndSentAtAfterOrderBySentAtDesc(Long receiverId, java.time.Instant after);
}
