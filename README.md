Atlas Uptime
A distributed uptime monitoring platform that uses multiple validator nodes and a consensus algorithm to accurately determine website availability, reducing false positives caused by regional network issues.

Built with Next.js, Express.js, Bun, Prisma, PostgreSQL, WebSockets, and Clerk Authentication.

Preview
(Add screenshots/GIFs of your dashboard here after deployment.)

Features
Monitor multiple websites from a single dashboard

Distributed validator architecture

Consensus-based website status detection

Cryptographically signed validator responses

WebSocket communication between Hub and Validators

Historical uptime tracking

Average latency calculation

Secure authentication using Clerk

Responsive, modern dashboard

PostgreSQL database with Prisma ORM

Architecture
text
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
How It Works
1. User adds a website
Users authenticate using Clerk and register websites for monitoring.

2. Hub assigns monitoring tasks
Every monitoring cycle, the Hub sends validation requests to all connected validator nodes through WebSockets.

3. Validators perform health checks
Each validator:

Pings the website

Measures latency

Determines whether the website is reachable

Signs the response cryptographically

Sends the signed result back to the Hub

4. Consensus algorithm
The Hub:

Verifies validator signatures

Prevents duplicate responses

Waits up to 5 seconds for validator replies

Calculates consensus using majority voting

Example:

Validator	Status
Node 1	Good
Node 2	Good
Node 3	Bad
Final consensus: Good

5. Data storage
The Hub stores:

Individual validator observations

Consensus result

Average latency

Latest website status

Monitoring history

6. Dashboard
Users can view:

Current website status

Historical uptime

Latency

Last checked time

Uptime percentage

Consensus Logic
Atlas Uptime uses a simple majority-vote consensus.

Example: Good, Good, Bad → Final status = Good

If enough validators do not respond within the timeout window, the monitoring round is marked as Unknown, preventing inaccurate results.

Tech Stack
Frontend: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI

Backend: Express.js, Bun Runtime, WebSockets

Database: PostgreSQL, Prisma ORM, Neon

Authentication: Clerk

Security: Ed25519 Digital Signatures, JWT Authentication

Project Structure
text
atlas-uptime/
├── apps/
│   ├── frontend/
│   ├── api/
│   ├── hub/
│   └── validator/
│
└── packages/
    ├── common/
    └── db/
Running Locally
Clone repository
bash
git clone https://github.com/shashankmishra21/atlas-uptime.git
cd atlas-uptime
Install dependencies
bash
bun install
Configure environment variables
Create the required .env files for the API, Hub, Validator, and Database.

text
DATABASE_URL=
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
JWT_PUBLIC_KEY=
Run the applications
API

bash
cd apps/api
bun index.ts
Hub

bash
cd apps/hub
bun index.ts
Validator

bash
cd apps/validator
bun index.ts
Frontend

bash
cd apps/frontend
bun run dev
Current Features
User authentication

Website registration

Multi-validator monitoring

WebSocket communication

Digital signature verification

Consensus algorithm

Timeout handling

Duplicate response prevention

Historical monitoring data

Dashboard analytics

Upcoming Features
Real-time dashboard updates (frontend WebSockets)

Public status pages

Email notifications

Discord / Slack alerts

Regional validator analytics

Incident timeline

Custom monitoring interval

SSL certificate monitoring

What I Learned
This project helped me gain practical experience with:

Distributed system design

WebSocket communication

Consensus algorithms

Backend architecture

Database design

Authentication and authorization

Real-time monitoring systems

Prisma ORM and PostgreSQL

Monorepo development using Turborepo

Author
Shashank Mishra
GitHub: shashankmishra21
LinkedIn: (Add your LinkedIn profile URL)

If you found this project interesting, consider giving it a star on GitHub.

