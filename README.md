E-Commerce Microservices Starter

This workspace contains a starter scaffold for a small e-commerce platform with three Spring Boot microservices:

- user-service: user registration, authentication (JWT), profile
- product-service: product CRUD (sellers only)
- media-service: media uploads with size/type validation

The scaffold provides core classes, controllers, and configuration to get you started. It uses MongoDB for persistence and JWT-based auth shared across services using a secret key (for demo). In production you should: use HTTPS, central auth service or OAuth2, service discovery, and secure secret management.

Requirements to run locally
- Java 17+ / OpenJDK
- Maven
- MongoDB running on localhost:27017

Next steps
- Customize and implement additional business logic and tests
- Add gateway and service discovery (Eureka) if needed
- Add Angular frontend in /frontend

Docker quick-start (optional)
------------------------------
I've added a `docker-compose.yml` and Dockerfiles for each backend service to make local testing easier. This will build the three Spring Boot services and bring up a MongoDB instance.

Quick run (from the repository root):

```powershell
docker-compose up --build
```

Important:
- The compose file sets example environment variables `JWT_SECRET` and `INTERNAL_TOKEN` — replace them with secure values before using in any shared environment.
- The services will be available on ports 8081 (user), 8082 (product), 8083 (media). Mongo is exposed on 27017.


See each service folder for run instructions.