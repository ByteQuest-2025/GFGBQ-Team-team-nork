# TruthLens AI – Backend

> **Polite, Secure, and Production-Ready Backend for Hallucination Verification.**

## 📌 Project Purpose
TruthLens AI is a VIBE-CODING backend designed to power a Hallucination & Citation Verification Engine. It provides secure authentication, protected content management, and a **highly polite, resilient server-side web scraper** for gathering verification data.

## 🏗 Architecture
- **Runtime**: Node.js 20 + Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis
- **Auth**: JWT (Access in Body, Refresh in HttpOnly Cookie)
- **Scraper**: Custom logic with `robots.txt` compliance, caches, and rate limiting.

## 🚀 Setup Instructions

### Prerequisites
- Node.js v20+
- Docker & Docker Compose
- MongoDB & Redis (or use Docker)

### Installation
1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   ```bash
   cp .env.example .env
   # Edit .env with your secrets
   ```

### Running Locally
```bash
# Development Mode (with hot-reload)
npm run dev

# Build & Start Production
npm run build
npm start
```

### Running with Docker (Recommended)
```bash
docker-compose up --build
```

## 🧪 Testing
We use **Jest** and **Supertest** with `mongodb-memory-server` for deterministic integration testing.

```bash
npm test
```

**Expected Output:**
```
PASS  tests/auth.test.ts
PASS  tests/scraper.test.ts
...
Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        3.456 s
```

## 🔒 Security Decisions
1.  **Token Delivery**:
    -   **Access Tokens**: Short-lived (15m), returned in JSON body.
    -   **Refresh Tokens**: Long-lived (7d), returned in **HttpOnly, Secure Cookie** to prevent XSS theft.
2.  **Rate Limiting**:
    -   Global: 100 req/min
    -   Login: 5 req/min (Brute-force protection)
    -   Scraper: 10 req/min (Resource protection)
3.  **Circuit Breaker Strategy (Proposed)**:
    -   Track consecutive failures per domain.
    -   Open circuit after 5 failures.
    -   Half-open after 30s cooldown.
    -   Close on success.

## 🕷️ Scraper Ethics & Politeness
This scraper is built with strict adherence to web etiquette:
-   **Robots.txt**: Always checked and respected per origin.
-   **Identification**: Sends `User-Agent: TruthLensAI-Bot/1.0`.
-   **Rate Limiting**: Includes exponential backoff for 429s.
-   **Consent**: Intended for educational and verification use only.

## ⚠️ Known Limitations
-   Redis is optional but highly recommended for distributed rate limiting.
-   Scraper currently fetches raw HTML; complex client-side rendered (SPA) pages may need Puppeteer/Playwright (out of scope for now).

## 📄 License
ISC
