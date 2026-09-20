@@ DISTRIBUTED URL SHORTENER
### Distributed Systems · Backend Engineering

### • Java, Spring Boot, PostgreSQL
### • Redis, AWS, Docker

### Overview

I developed a distributed URL-shortening service with REST APIs for URL generation, redirection, and analytics tracking. The system was designed around scalable backend architecture rather than treating URL shortening as a simple database lookup.

### Implementation

I implemented Redis caching and rate limiting to reduce repeated database access and protect backend resources, reducing average response latency by approximately 60% in my testing. Persistent URL data and analytics are managed through PostgreSQL.

### Engineering Focus

I containerized the services with Docker and deployed them on AWS using a scalable microservices-oriented architecture. The project allowed me to explore how caching, persistence, API design, rate limiting, and deployment decisions influence system behavior under increasing demand.
