package com.wellnest.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

  @Value("${jwt.secret}")
  private String secret;

  @Value("${jwt.expiration}")
  private long expirationMs;

  private SecretKey key() {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(String email, Long userId, String role) {
    Date now = new Date();
    Date exp = new Date(now.getTime() + expirationMs);
    return Jwts.builder()
        .subject(email)
        .claim("uid", userId)
        .claim("role", role)
        .issuedAt(now)
        .expiration(exp)
        .signWith(key())
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
  }

  public String getEmail(String token) {
    return parseClaims(token).getSubject();
  }

  public Long getUserId(String token) {
    Object uid = parseClaims(token).get("uid");
    if (uid instanceof Integer i) {
      return i.longValue();
    }
    if (uid instanceof Long l) {
      return l;
    }
    return Long.parseLong(uid.toString());
  }

  public boolean validate(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
