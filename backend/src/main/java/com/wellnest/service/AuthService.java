package com.wellnest.service;

import com.wellnest.dto.AuthDtos.LoginRequest;
import com.wellnest.dto.AuthDtos.LoginResponse;
import com.wellnest.dto.AuthDtos.SignupRequest;
import com.wellnest.dto.AuthDtos.UserMeResponse;
import com.wellnest.model.PrivacySettings;
import com.wellnest.model.Role;
import com.wellnest.model.User;
import com.wellnest.repository.PrivacySettingsRepository;
import com.wellnest.repository.UserRepository;
import com.wellnest.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PrivacySettingsRepository privacySettingsRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;
  private final AuthenticationManager authenticationManager;

  public AuthService(
      UserRepository userRepository,
      PrivacySettingsRepository privacySettingsRepository,
      PasswordEncoder passwordEncoder,
      JwtUtil jwtUtil,
      AuthenticationManager authenticationManager) {
    this.userRepository = userRepository;
    this.privacySettingsRepository = privacySettingsRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtUtil = jwtUtil;
    this.authenticationManager = authenticationManager;
  }

  @Transactional
  public LoginResponse signup(SignupRequest req) {
    if (userRepository.findByEmail(req.email()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }
    User user = new User();
    user.setName(req.name());
    user.setEmail(req.email());
    user.setPassword(passwordEncoder.encode(req.password()));
    user.setPhone(req.phone() != null ? req.phone() : "");
    user.setRole(Role.MOTHER);
    user = userRepository.save(user);
    PrivacySettings settings = new PrivacySettings();
    settings.setUser(user);
    privacySettingsRepository.save(settings);
    String token =
        jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
    return new LoginResponse(token, toMe(user));
  }

  public LoginResponse login(LoginRequest req) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email(), req.password()));
    User user =
        userRepository
            .findByEmail(req.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    String token =
        jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
    return new LoginResponse(token, toMe(user));
  }

  @Transactional
  public UserMeResponse setRole(User user, Role role) {
    if (role != Role.MOTHER && role != Role.FAMILY) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
    }
    user.setRole(role);
    userRepository.save(user);
    return toMe(user);
  }

  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public UserMeResponse me(User user) {
    User full =
        userRepository.findByIdWithMother(user.getId()).orElse(user);
    return toMe(full);
  }

  private UserMeResponse toMe(User u) {
    Long mid = u.getLinkedMother() != null ? u.getLinkedMother().getId() : null;
    return  new UserMeResponse(
        u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(), mid);
  }
}
