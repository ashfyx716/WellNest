package com.wellnest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class OpenAIConfig {

  @Bean
  public RestClient openAiRestClient(@Value("${openai.url}") String baseUrl) {
    return RestClient.builder().baseUrl(baseUrl).build();
  }
}
