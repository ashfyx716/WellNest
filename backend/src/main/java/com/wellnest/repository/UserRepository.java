package com.wellnest.repository;

import com.wellnest.model.Role;
import com.wellnest.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.linkedMother WHERE u.id = :id")
  Optional<User> findByIdWithMother(@Param("id") Long id);

  Optional<User> findByEmailAndRole(String email, Role role);

  List<User> findByLinkedMother_Id(Long motherId);
}
