FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre

# Création d'un user non-root pour éxécuter l'appli en toute sécurité
# --system : pour créer un groupe et un utilisateur système, qui n'ont pas de mot de passe et ne peuvent pas se connecter
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

WORKDIR /app

RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Copier le jar en changeant le propriétaire "chown"
# On donne la propriété du fichier à appuser : ainsi, même si le conteneur est exécuté avec un autre utilisateur, il pourra accéder au fichier
COPY --from=build --chown=appuser:appgroup /app/target/*.jar ./app.jar

# On change le user : plus aucune commande ne sera exécutée en root, mais en appuser
USER appuser

EXPOSE 8084
ENTRYPOINT ["java","-jar","/app/app.jar"]
