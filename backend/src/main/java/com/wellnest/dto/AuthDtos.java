package com.wellnest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.wellnest.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

  private AuthDtos() {}

  public record SignupRequest(
      @NotBlank @Size(max = 100) String name,
      @NotBlank @Email String email,
      @NotBlank @Size(min = 6) String password,
      @Size(max = 20) String phone) {}

  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

  public record SetRoleRequest(Role role) {}

  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record UserMeResponse(
      Long id,
      String name,
      String email,
      String phone,
      Role role,
      Long linkedMotherId) {}

  public record LoginResponse(String token, UserMeResponse user) {}
}
