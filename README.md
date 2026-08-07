# Atlas Uptime

Atlas Uptime is a distributed uptime monitoring platform that uses multiple validator nodes and a consensus algorithm to determine website availability, reducing false positives caused by regional network issues.

Built with Next.js, Express.js, Bun, Prisma, PostgreSQL, WebSockets, and Clerk Authentication.

---

## Overview

- Monitor multiple websites from a single dashboard
- Distributed validator architecture
- Consensus-based website status detection
- Cryptographically signed validator responses
- WebSocket communication between hub and validators
- Historical uptime and latency tracking
- Secure authentication with Clerk
- PostgreSQL database with Prisma ORM

---

## Architecture

```text
                    +------------------+
                    |    Frontend      |
                    |     Next.js      |
                    +---------+--------+
                              |
                        REST API
                              |
                              v
                    +------------------+
                    |      API         |
                    |    Express.js    |
                    +---------+--------+
                              |
                        PostgreSQL
                              |
                              v
                    +------------------+
                    |     Database     |
                    | PostgreSQL/Neon  |
                    +------------------+

                              ^
                              |
                    Monitoring Results
                              |
                     Consensus Engine
                              |
                              v
                    +------------------+
                    |       Hub        |
                    |   Bun + WS       |
                    +---------+--------+
                              |
         ---------------------------------------------
         |                    |                      |
         v                    v                      v
   Validator 1          Validator 2          Validator 3
```

---

## How It Works

### 1. User adds a website

- Users authenticate using Clerk.
- Authenticated users register websites to be monitored.

### 2. Hub assigns monitoring tasks

- On each monitoring cycle, the hub sends validation requests to all connected validators via WebSockets.

### 3. Validators perform health checks

Each validator:

- Pings the website
- Measures latency
- Determines whether the website is reachable
- Signs the response cryptographically
- Sends the signed result back to the hub

### 4. Consensus algorithm

The hub:

- Verifies validator signatures
- Prevents duplicate responses
- Waits up to a configured timeout (e.g., 5 seconds) for replies
- Computes a majority-vote consensus for the website status

Example:

| Validator | Status |
|----------|--------|
| Node 1   | Good   |
| Node 2   | Good   |
| Node 3   | Bad    |

Final consensus: **Good**

### 5. Data storage

The hub stores:

- Individual validator observations
- Consensus result
- Average latency
- Latest website status
- Monitoring history

### 6. Dashboard

The dashboard allows users to view:

- Current website status
- Historical uptime
- Latency
- Last checked time
- Uptime percentage

---

## Consensus Logic

Atlas Uptime uses a simple majority-vote consensus.

Example: `Good, Good, Bad` → final status = **Good**

If not enough validators respond within the timeout window, the monitoring round is marked as `Unknown` to avoid inaccurate results.

---

## Tech Stack

**Frontend**

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend**

- Express.js
- Bun runtime
- WebSockets

**Database**

- PostgreSQL
- Prisma ORM
- Neon

**Authentication**

- Clerk

**Security**

- Ed25519 digital signatures
- JWT-based authentication

---

## Project Structure

```text
atlas-uptime/
├── apps/
│   ├── frontend/   # Next.js dashboard
│   ├── api/        # REST API (Express)
│   ├── hub/        # WebSocket hub + consensus engine
│   └── validator/  # Validator node service
│
└── packages/
    ├── common/     # Shared types and utilities
    └── db/         # Prisma schema and database client
```

---

## Running Locally

### 1. Clone repository

```bash
git clone https://github.com/shashankmishra21/atlas-uptime.git
cd atlas-uptime
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

Create the required `.env` files for the API, hub, validator, and frontend.

Example:

```env
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
JWT_PUBLIC_KEY=
```

### 4. Run the services

API:

```bash
cd apps/api
bun index.ts
```

Hub:

```bash
cd apps/hub
bun index.ts
```

Validator:

```bash
cd apps/validator
bun index.ts
```

Frontend:

```bash
cd apps/frontend
bun run dev
```

---

## Current Features

- User authentication
- Website registration
- Multi-validator monitoring
- WebSocket communication between hub and validators
- Digital signature verification
- Majority-vote consensus algorithm
- Timeout handling for slow/unresponsive validators
- Duplicate response prevention
- Historical monitoring data
- Basic dashboard analytics

---

## Planned Improvements

- Real-time dashboard updates via WebSockets
- Public status pages
- Email notifications
- Discord / Slack alerts
- Regional validator analytics
- Incident timeline
- Custom monitoring intervals
- SSL certificate monitoring

---

## What I Learned

This project helped me gain practical experience with:

- Designing a small distributed system
- WebSocket-based communication patterns
- Implementing and reasoning about consensus algorithms
- Backend architecture and service separation
- Database schema design with Prisma and PostgreSQL
- Authentication and authorization using Clerk and JWTs
- Real-time monitoring concepts (uptime, latency, history)
- Monorepo development with Turborepo

---

## Author

**Shashank Mishra**

- GitHub: https://github.com/shashankmishra21
- LinkedIn: https://www.linkedin.com/in/mishrashashank2106