# API Gateway

## Overview

The **api-gateway** is the single entry point for all client requests to the Marketplace platform. It securely routes requests to the appropriate backend services while enforcing authentication, authorization, rate limiting, request validation, and security policies.

Clients never communicate directly with internal services.

---

## Responsibilities

- Request routing
- Authentication middleware
- Authorization
- Rate limiting
- Request validation
- Security headers
- CORS management
- API versioning
- Request logging
- Service discovery
- Health checks
- Load balancing support
- Error handling

---

## Connected Services

- Auth Service
- Backend API
- Payment Service
- Notification Service
- Realtime Service
- Communication Service

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Redis
- JWT
- Docker
- GitHub Actions

---

## Security

- JWT verification
- Rate limiting
- IP filtering
- Helmet security headers
- CORS protection
- Request validation
- Secure proxy routing

---

## License

Licensed under the Marketplace project license. See the `LICENSE` file for details.
