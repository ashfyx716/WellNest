package com.wellnest.controller;

import com.wellnest.dto.AuthDtos.*;
import com.wellnest.model.Role;
import com.wellnest.service.AuthFacade;
import com.wellnest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;
  private final AuthFacade authFacade;

  public AuthController(AuthService authService, AuthFacade authFacade) {
    this.authService = authService;
    this.authFacade = authFacade;
  }

  @PostMapping("/signup")
  public LoginResponse signup(@Valid @RequestBody SignupRequest req) {
    return authService.signup(req);
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest req) {
    return authService.login(req);
  }

  @PatchMapping("/set-role")
  public UserMeResponse setRole(@Valid @RequestBody SetRoleRequest req) {
    var user = authFacade.requireUser();
    return authService.setRole(user, req.role());
  }

  @GetMapping("/me")
  public UserMeResponse me() {
    return authService.me(authFacade.requireUser());
  }
}
