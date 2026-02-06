# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ 필수 작업 규칙 (Mandatory Workflow)

### 1. 계획 수립 (Planning)
사용자가 **의견을 물어보거나 작업 요청**을 하면:
1. **Plan 모드로 전환**하여 작업 시작
2. `docs/plans/` 폴더에 작업 계획서 작성
3. 파일명 형식: `NNN.파일이름.md` (예: `001.프로젝트_초기설정.md`)
4. 기존 파일 번호를 확인하여 순차적으로 넘버링

### 2. 작업 완료 기록 (Work Log)
작업이 완료되면:
1. `docs/worklogs/` 폴더에 작업 내역 기록
2. 파일명 형식: `NNN.파일이름.md` (예: `001.프로젝트_초기설정.md`)
3. 계획서와 동일한 번호 사용 권장

### 3. 작업 단위 완료 기준
**소스 코드 작업 시, git push까지 완료해야 하나의 작업 단위가 종료됨**

```
작업 흐름:
[의견 요청] → [Plan 모드 전환] → [계획서 작성] → [작업 수행] → [git commit & push] → [작업일지 작성] → [완료]
```

### 문서 폴더 구조
```
docs/
├── plans/           # 작업 계획서
│   ├── 001.xxx.md
│   └── 002.xxx.md
├── worklogs/        # 작업 완료 기록
│   ├── 001.xxx.md
│   └── 002.xxx.md
└── structure/       # 설계 문서
```

---

## Project Overview

**이사매칭 (Moving Match)** — An AI-powered moving service matching platform that connects customers with optimal moving companies through natural language input, guided conversations, or traditional forms.

### Core Value Proposition
- **3-Mode Input System**: Guided conversation (rule-based, no AI), free text (AI parsing), and traditional form
- **AI Matching**: Automatic matching of customers to optimal moving companies based on criteria
- **Mobile-First PWA**: Next.js web app installable as PWA, with planned Flutter native app expansion

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR/SSG, mobile-first |
| Styling | Tailwind CSS 4.x + shadcn/ui | Responsive, accessible |
| State | Zustand 5.x | Chat + form synchronization |
| Forms | React Hook Form + Zod | Schema-based validation |
| Backend | Supabase | Auth, PostgreSQL, Storage, Realtime, Edge Functions |
| AI | Gemini 2.5 Flash | JSON mode parsing, Korean language support |
| Address API | Kakao Address API v3 | Korean address search |
| SMS | Solapi | Phone verification |
| Deployment | Vercel | Next.js optimized hosting |

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev                    # http://localhost:3000

# Build & Production
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Supabase (if CLI installed)
supabase start                 # Local development
supabase db push               # Push migrations
supabase functions deploy      # Deploy Edge Functions
```

## Planned Directory Structure

```
moving-match/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (customer)/                # Customer routes
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── estimate/              # Estimate request (chat+form)
│   │   │   └── mypage/                # Customer dashboard
│   │   ├── (company)/                 # Moving company routes
│   │   │   ├── dashboard/             # Company dashboard
│   │   │   └── matches/               # Match list & details
│   │   ├── (admin)/                   # Admin routes
│   │   └── api/chat/route.ts          # AI chat API proxy
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── chat/                      # Chat components
│   │   │   ├── GuidedStep.tsx         # Guided conversation step
│   │   │   └── ChatWindow.tsx
│   │   ├── form/                      # Estimate form sections
│   │   └── estimate/                  # Estimate page components
│   │       └── HybridLayout.tsx       # Chat+form hybrid
│   │
│   ├── lib/
│   │   ├── supabase/                  # Supabase clients
│   │   ├── gemini/                    # Gemini API client & prompts
│   │   ├── guided-flow/               # Rule-based conversation engine
│   │   │   ├── steps.ts               # Question sequence
│   │   │   └── engine.ts              # Step progression logic
│   │   └── utils/
│   │       ├── schema.ts              # Input Schema utilities
│   │       └── inputDetector.ts       # AI call necessity detection
│   │
│   ├── stores/
│   │   ├── estimateStore.ts           # Estimate state (Zustand)
│   │   └── chatStore.ts               # Chat state
│   │
│   └── types/
│       ├── schema.ts                  # Input Schema v2.1 types
│       └── database.ts                # Supabase DB types
│
├── supabase/
│   ├── migrations/                    # DB migrations
│   └── functions/                     # Edge Functions (Deno)
│       ├── parse-moving-input/        # AI parsing
│       └── match-company/             # Matching algorithm
│
└── public/
    └── manifest.json                  # PWA config
```

## Architecture

### 3-Mode Input System

1. **Guided Conversation (Default)** — No AI API calls
   - Rule-based chatbot with buttons/cards/calendars
   - One question at a time, mobile-friendly
   - Tip cards with illustrations for complex decisions

2. **Free Text Input** — AI parsing via Gemini
   - Triggered when user types complex multi-field input
   - Parses to Input Schema, then resumes guided flow

3. **Form Direct Input** — No AI API calls
   - Traditional form view, synced with chat in real-time

### Input Schema v2.1 (Single Source of Truth)

All input modes map to a unified JSON schema:

```typescript
interface MovingSchema {
  meta: { requestId, source, platform, version };
  move: { category, type, schedule, timeSlot };
  departure: { address, floor, hasElevator, parking, squareFootage };
  arrival: { address, floor, hasElevator, parking, squareFootage };
  cargo: { appliances, furniture, special, boxes };
  services: { ladderTruck, airconInstall, cleaning, storage, disposal };
  conditions: { extraRequests, vehiclePreference, customerParticipation };
  contact: { name, phone, carrier, preferredTime };
  status: { completionRate, missingRequired, fieldConfidence, readyForSubmit };
}
```

### AI Matching Algorithm

Rule-based weighted scoring:
- Region: 30% (departure/arrival coverage)
- Move type: 25% (company specialization match)
- Schedule: 20% (availability on desired date)
- Vehicle: 15% (required capacity)
- Rating: 10% (customer reviews)

## Key Concepts

### Move Categories (이사 종류)
`one_room` | `two_room` | `three_room_plus` | `officetel` | `apartment` | `villa_house` | `office`

### Move Types (이사 형태)
- `truck` — 용달이사 (transport only)
- `general` — 일반이사 (transport + basic placement)
- `half_pack` — 반포장이사 (partial packing)
- `full_pack` — 포장이사 (full service)
- `storage` — 보관이사 (with storage)

### Confidence Scoring
AI-parsed fields have confidence scores (0-1):
- 0.8-1.0: Auto-apply
- 0.5-0.79: Apply + ask for confirmation
- 0.0-0.49: Don't apply, ask directly

## Database Tables

| Table | Purpose |
|-------|---------|
| profiles | Users (customer/company/admin roles) |
| companies | Moving company profiles |
| estimates | Estimate requests (schema_data JSONB) |
| matchings | Match history between estimates and companies |
| reviews | Customer reviews |
| chat_messages | Chat history per estimate |

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini AI
GEMINI_API_KEY=

# Kakao
NEXT_PUBLIC_KAKAO_JS_KEY=
KAKAO_REST_API_KEY=

# SMS (Solapi)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=
```

## Documentation

Detailed specifications are in `docs/structure/`:
- PRD v1.2: Product requirements
- 기술 스택 v1.0: Technical architecture
- Input Schema v2.1: Data structure specification
- 입력전략 v1.1: 3-mode input strategy design
