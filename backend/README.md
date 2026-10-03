# Instagram AI Auto-Reply SaaS Backend

Production-grade Express REST API service powering automated Instagram comment & DM AI responses, powered by Vercel AI SDK, Prisma ORM, and official Meta Instagram Graph API.

## Features
- **Meta OAuth & Instagram Graph API**: Secure server-side access token management, Graph API client, and Meta Webhook verification.
- **Special Rule Precedence Engine**: High-priority keyword trigger matching (EXACT & SEMANTIC) executing before generic AI comment/DM fallbacks.
- **Vercel AI SDK Integration**: Isolated AI service layer with Zod schema output validation (`{ shouldReply, reply, reason }`).
- **Prisma & PostgreSQL**: Full relational schema for Users, Accounts, Posts/Reels, Special Rules, Comments, DM Inbox, and Activity logs.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 3. Database Migration & Prisma Generation
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Unit Tests
```bash
npm test
```
