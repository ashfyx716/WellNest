# Build stage
FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/wellnest-backend-1.0.0.jar app.jar

# Render sets PORT dynamically
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8081} -jar app.jar"]
