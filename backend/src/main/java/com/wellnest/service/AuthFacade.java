package com.wellnest.service;

import com.wellnest.model.User;
import com.wellnest.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AuthFacade {

  private final UserRepository userRepository;

  public AuthFacade(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User requireUser() {
    var auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null
        || !auth.isAuthenticated()
        || auth.getName() == null
        || "anonymousUser".equals(auth.getName())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    User u =
        userRepository
            .findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    return userRepository.findByIdWithMother(u.getId()).orElse(u);
  }
}
