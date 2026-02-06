# 이삿짐 AI 매칭 플랫폼 — 기술 스택 & 아키텍처 설계서

## Technical Architecture Document v1.0

**기준 문서:** PRD v1.1, Input Schema v2.0
**작성일:** 2026-02-06
**기술 스택 결정 사항:**
- 프론트엔드: Next.js (웹 MVP, 모바일 퍼스트)
- 백엔드: Supabase (BaaS)
- AI 엔진: Gemini 2.5 Flash (무료 티어 활용)
- 추후 확장: Flutter 네이티브 앱

---

## 1. 기술 스택 총괄

### 1.1 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                    클라이언트                          │
│  Next.js 15 (App Router) + TypeScript + Tailwind CSS │
│  PWA 지원 (모바일 앱처럼 설치 가능)                     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                   Supabase                           │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐  │
│  │  Auth   │ │ Database │ │Storage │ │ Realtime  │  │
│  │(인증)   │ │(Postgres)│ │(파일)  │ │(실시간)   │  │
│  └────────┘ └──────────┘ └────────┘ └───────────┘  │
│  ┌─────────────────────────────────────────────┐    │
│  │          Edge Functions (Deno)               │    │
│  │  • AI 파싱   • 매칭 알고리즘   • 알림 발송    │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  외부 서비스                           │
│  • Gemini 2.5 Flash  • 카카오 주소/로그인  • SMS API  │
└─────────────────────────────────────────────────────┘
```

### 1.2 상세 기술 스택

| 영역 | 기술 | 버전 | 선정 이유 |
|------|------|------|-----------|
| **프레임워크** | Next.js | 15.x (App Router) | SSR/SSG, API Routes, Vercel 배포 최적화 |
| **언어** | TypeScript | 5.x | 타입 안정성, Input Schema 타입 공유 |
| **스타일링** | Tailwind CSS | 4.x | 모바일 퍼스트 반응형, 빠른 UI 개발 |
| **UI 컴포넌트** | shadcn/ui | latest | 접근성, 커스터마이징 용이 |
| **상태관리** | Zustand | 5.x | 가벼움, 채팅+폼 동기화에 적합 |
| **폼 관리** | React Hook Form + Zod | latest | Schema 기반 검증, 타입 안전 |
| **BaaS** | Supabase | latest | Auth/DB/Storage/Realtime 통합 |
| **DB** | PostgreSQL | 15 (Supabase 내장) | RLS, JSONB 지원, 인덱스 |
| **서버 함수** | Supabase Edge Functions | Deno | AI API 호출, 비즈니스 로직 |
| **AI** | Gemini 2.5 Flash | latest | 무료 티어, 빠른 응답, JSON 모드 |
| **주소 검색** | 카카오 주소 API | v3 | 무료, 한국 주소 정확도 높음 |
| **SMS** | Solapi | — | 한국 SMS 발송, 합리적 가격 (~15원/건) |
| **배포** | Vercel | — | Next.js 최적화, 무료 티어 |

### 1.3 선정 근거

#### Next.js 선택 이유 (vs Flutter Web, vs React SPA)

| 항목 | Next.js | Flutter Web | React SPA |
|------|---------|-------------|-----------|
| SEO (랜딩 페이지) | ✅ SSR/SSG | ❌ 어려움 | ❌ CSR |
| 초기 로딩 | ✅ 빠름 | ❌ WASM 무거움 | ⚡ 보통 |
| 앱스토어 심사 | 불필요 | 필요 | 불필요 |
| MVP 개발 속도 | ✅ 빠름 | ⚡ 보통 | ✅ 빠름 |
| PWA 지원 | ✅ 네이티브급 | ✅ 지원 | ✅ 지원 |
| Supabase 연동 | ✅ @supabase/ssr | ⚡ supabase-flutter | ✅ @supabase/js |

> **결론:** MVP는 Next.js 웹으로 빠르게 검증 → 트랙션 확보 후 Flutter 앱 전환 가능 (Supabase 백엔드 그대로 유지)

#### Supabase 선택 이유

| 기능 | 직접 구축 시 | Supabase 사용 시 | 절감 시간 |
|------|-------------|-----------------|----------|
| 인증 | JWT + OAuth 직접 구현 | `supabase.auth` (카카오 OAuth 내장) | ~1주 |
| DB | PostgreSQL 설치 + ORM | 관리형 PostgreSQL + 대시보드 | ~3일 |
| 실시간 | Socket.io 직접 구현 | `supabase.channel()` 내장 | ~1주 |
| 파일 저장 | S3 + 업로드 로직 | `supabase.storage` 내장 | ~3일 |
| RLS 보안 | 미들웨어 직접 구현 | SQL 정책 선언만으로 완료 | ~3일 |
| **합계** | | | **약 3주 절감** |

#### Gemini 2.5 Flash 선택 이유

| 항목 | 상세 |
|------|------|
| **비용** | 무료: 15 RPM, 1,000 RPD, 250K TPM → MVP 일 50건 충분 |
| **속도** | Flash 모델 응답 1~2초 → 채팅 UX에 적합 |
| **JSON 모드** | `responseMimeType: "application/json"` → Schema 파싱에 최적 |
| **한국어** | 2.5부터 한국어 성능 크게 향상 |
| **업그레이드** | Gemini Pro, Claude Haiku로 전환 용이 (동일 인터페이스) |

---

## 2. 핵심 데이터 흐름

### 2.1 견적 신청 (AI 채팅 파싱)

```
[사용자 채팅 입력]
    │ "원룸이고 3월 말에 강남에서 마포로 포장이사 해요"
    ▼
[Next.js API Route: /api/chat]
    │ body: { message, currentSchema, chatHistory }
    ▼
[Supabase Edge Function: parse-moving-input]
    │ 1. System Prompt + 현재 Schema + 메시지 → Gemini 전송
    │ 2. responseMimeType: "application/json" 설정
    ▼
[Gemini 2.5 Flash]
    │ 파싱 결과:
    │ {
    │   "updates": { "move.category": "one_room", "move.type": "full_pack", ... },
    │   "confidence": { "move.category": 0.95, "departure.address": 0.75 },
    │   "missingRequired": ["departure.floor", "departure.hasElevator", ...]
    │ }
    ▼
[Edge Function: 후처리]
    │ 1. Schema 병합 (기존 + 새 파싱 결과)
    │ 2. completionRate 재계산
    │ 3. 추가 질문 메시지 생성 (missingRequired 기반)
    │ 4. DB 저장 (estimates 테이블)
    ▼
[클라이언트]
    │ 1. Zustand 스토어 업데이트
    │ 2. 채팅: AI 응답 + 추가 질문 표시
    │ 3. 폼: 해당 필드 자동 채움 반영
    │ 4. 진행률 바 업데이트 (35% → 52%)
```

### 2.2 AI 매칭

```
[견적 제출 (status → 'submitted')]
    ▼
[DB Trigger → Edge Function: match-company]
    │ 1. 업체 풀 필터링 (지역 + 이사형태 + 일정)
    │ 2. 가중치 스코어링 (지역 30%, 형태 25%, 일정 20%, 차량 15%, 평점 10%)
    │ 3. 최고 점수 업체 1곳 선정
    ▼
[매칭 기록 생성 (matchings 테이블)]
    │ status: 'pending', expires_at: now + 30분
    ▼
[알림 발송 (SMS + Realtime)]
    │ 업체: "새 매칭 건이 도착했습니다"
    │ 고객: "매칭이 진행 중입니다"
    ▼
[업체 응답 대기]
    ├── 수락 → 고객에게 업체 정보 안내
    ├── 거절 → 차순위 업체 재배정
    └── 30분 타임아웃 → 자동 재배정 (최대 3회)
        └── 3회 실패 → 관리자 수동 개입
```

### 2.3 실시간 상태 업데이트 (Supabase Realtime)

| 채널 | 대상 | 이벤트 |
|------|------|--------|
| `estimate:{id}` | 고객 | 견적 상태 변경 (submitted → matching → matched) |
| `company:{id}` | 업체 | 새 매칭 건 도착, 타임아웃 경고 |
| `admin:dashboard` | 관리자 | 실시간 전체 현황 |

---

## 3. 프로젝트 디렉토리 구조

```
moving-match/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (customer)/                # 고객용 라우트 그룹
│   │   │   ├── page.tsx               # 랜딩 페이지
│   │   │   ├── estimate/page.tsx      # 견적 신청 (채팅+폼)
│   │   │   ├── estimate/confirm/      # 정보 확인 & 제출
│   │   │   ├── estimate/result/       # 매칭 결과
│   │   │   └── mypage/page.tsx        # 마이페이지
│   │   │
│   │   ├── (company)/                 # 업체용 라우트 그룹
│   │   │   ├── dashboard/page.tsx     # 업체 대시보드
│   │   │   ├── matches/page.tsx       # 매칭 목록 & 상세
│   │   │   ├── profile/page.tsx       # 프로필 관리
│   │   │   └── settlement/page.tsx    # 정산 내역
│   │   │
│   │   ├── (admin)/                   # 관리자 라우트 그룹
│   │   │   ├── dashboard/page.tsx     # 관리자 대시보드
│   │   │   ├── matches/page.tsx       # 매칭 관리
│   │   │   ├── companies/page.tsx     # 업체 관리
│   │   │   └── customers/page.tsx     # 고객 관리
│   │   │
│   │   ├── api/chat/route.ts          # AI 채팅 API 프록시
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui 기본 컴포넌트
│   │   ├── chat/                      # 채팅 컴포넌트
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── form/                      # 견적 폼 컴포넌트
│   │   │   ├── EstimateForm.tsx       # 전체 폼 컨테이너
│   │   │   ├── MoveInfoSection.tsx    # 이사 기본 정보
│   │   │   ├── LocationSection.tsx    # 출발지/도착지
│   │   │   ├── CargoSection.tsx       # 짐 정보
│   │   │   ├── ServiceSection.tsx     # 부가 서비스
│   │   │   └── ContactSection.tsx     # 연락처
│   │   ├── estimate/                  # 견적 페이지 전용
│   │   │   ├── HybridLayout.tsx       # 채팅+폼 하이브리드
│   │   │   ├── ProgressBar.tsx        # 완성도 진행률
│   │   │   └── MobileTabSwitch.tsx    # 모바일 탭 전환
│   │   ├── company/                   # 업체 전용 컴포넌트
│   │   └── admin/                     # 관리자 전용 컴포넌트
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # 브라우저 클라이언트
│   │   │   ├── server.ts              # 서버 클라이언트
│   │   │   └── middleware.ts          # 인증 미들웨어
│   │   ├── gemini/
│   │   │   ├── client.ts              # Gemini API 클라이언트
│   │   │   ├── prompts.ts             # 시스템 프롬프트
│   │   │   └── parser.ts              # 응답 파싱 유틸
│   │   └── utils/
│   │       ├── schema.ts              # Schema v2.0 유틸리티
│   │       └── validation.ts          # Zod 검증 스키마
│   │
│   ├── stores/
│   │   ├── estimateStore.ts           # 견적 상태 (Zustand)
│   │   └── chatStore.ts               # 채팅 상태
│   │
│   └── types/
│       ├── schema.ts                  # Input Schema v2.0 타입
│       └── database.ts                # Supabase DB 타입
│
├── supabase/
│   ├── migrations/                    # DB 마이그레이션
│   │   ├── 001_profiles.sql
│   │   ├── 002_companies.sql
│   │   ├── 003_estimates.sql
│   │   ├── 004_matchings.sql
│   │   └── 005_reviews.sql
│   ├── functions/                     # Edge Functions
│   │   ├── parse-moving-input/index.ts
│   │   ├── match-company/index.ts
│   │   ├── send-notification/index.ts
│   │   └── handle-timeout/index.ts
│   └── seed.sql
│
├── public/
│   ├── manifest.json                  # PWA
│   └── icons/
│
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 4. 핵심 모듈 상세 설계

### 4.1 AI 파싱 모듈

#### 시스템 프롬프트

```typescript
// lib/gemini/prompts.ts
export const SYSTEM_PROMPT = `
당신은 이사 견적 정보 파싱 전문가입니다.
사용자의 자연어 입력을 분석하여 JSON Schema에 매핑합니다.

## 규칙
1. 명확한 정보만 즉시 매핑 (confidence 0.7 이상)
2. 모호한 정보는 낮은 confidence로 설정 후 확인 질문
3. "모름/잘 모르겠어요" → "unknown"으로 처리
4. 기존 값은 유지, 새 정보만 업데이트

## 질문 생성 우선순위
P1: 층수, 엘리베이터 (비용 영향)
P2: 일정 확정 (범위 → 확정일)
P3: 이사 분류 (종류/형태)
P4: 연락처 (최종 제출 직전)

## 응답 형식 (JSON)
{
  "message": "사용자에게 보여줄 친근한 메시지",
  "updates": { /* Schema v2.0 필드 업데이트 (변경된 것만) */ },
  "confidence": { "필드경로": 0.0~1.0 },
  "missingRequired": [
    { "field": "departure.floor", "priority": 1, "question": "출발지 몇 층인가요?" }
  ]
}
`;
```

#### Edge Function

```typescript
// supabase/functions/parse-moving-input/index.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);

Deno.serve(async (req) => {
  const { message, currentSchema, chatHistory } = await req.json();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,  // 파싱이므로 결정적 응답
    },
  });

  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [
      { role: "user", parts: [{ text: `현재 Schema:\n${JSON.stringify(currentSchema)}` }] },
      ...chatHistory,
      { role: "user", parts: [{ text: message }] },
    ],
  });

  const parsed = JSON.parse(result.response.text());

  // 후처리: Schema 병합 + completionRate 재계산
  const merged = mergeSchema(currentSchema, parsed.updates);
  merged.status.completionRate = calculateCompletionRate(merged);
  merged.status.missingRequired = parsed.missingRequired;

  return new Response(JSON.stringify({
    schema: merged,
    message: parsed.message,
  }));
});
```

### 4.2 채팅 + 폼 동기화 (Zustand)

```typescript
// stores/estimateStore.ts
import { create } from 'zustand';
import type { MovingSchema } from '@/types/schema';

interface EstimateState {
  schema: MovingSchema;             // Single Source of Truth
  activeTab: 'chat' | 'form';      // 모바일 탭 상태
  isSubmitting: boolean;

  // AI 파싱 결과로 Schema 업데이트
  applyAIUpdate: (updates: Partial<MovingSchema>, confidence: Record<string, number>) => void;

  // 폼에서 직접 수정
  updateField: (path: string, value: any) => void;

  // 탭 전환
  setActiveTab: (tab: 'chat' | 'form') => void;
}

export const useEstimateStore = create<EstimateState>((set, get) => ({
  schema: createEmptySchema(),
  activeTab: 'chat',
  isSubmitting: false,

  applyAIUpdate: (updates, confidence) =>
    set((state) => {
      const merged = deepMerge(state.schema, updates);
      // confidence 기록
      Object.entries(confidence).forEach(([field, score]) => {
        merged.status.fieldConfidence[field] = {
          value: getNestedValue(merged, field),
          confidence: score,
          source: 'chat',
        };
      });
      merged.status.completionRate = calculateCompletionRate(merged);
      return { schema: merged };
    }),

  updateField: (path, value) =>
    set((state) => {
      const updated = setNestedValue({ ...state.schema }, path, value);
      // 사용자 직접 입력 → confidence 1.0
      updated.status.fieldConfidence[path] = {
        value,
        confidence: 1.0,
        source: 'form',
      };
      updated.status.completionRate = calculateCompletionRate(updated);
      return { schema: updated };
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
```

### 4.3 매칭 알고리즘 (v1 — 규칙 기반)

```typescript
// supabase/functions/match-company/index.ts

interface MatchScore {
  companyId: string;
  totalScore: number;
  breakdown: {
    region: number;    // 가중치 30%
    moveType: number;  // 가중치 25%
    schedule: number;  // 가중치 20%
    vehicle: number;   // 가중치 15%
    rating: number;    // 가중치 10%
  };
}

async function runMatching(estimateId: string): Promise<void> {
  const estimate = await getEstimate(estimateId);

  // Step 1: 필터링 (Hard Filter — 필수 조건)
  const candidates = await supabase
    .from('companies')
    .select('*')
    .eq('status', 'active')
    .contains('service_regions', [estimate.departureRegion])
    .contains('move_types', [estimate.moveType]);

  // Step 2: 일정 가용 확인
  const available = await filterByAvailability(candidates.data, estimate.desiredDate);

  // Step 3: 스코어링 (Soft Score — 가중치)
  const scored: MatchScore[] = available.map((company) => ({
    companyId: company.id,
    totalScore:
      regionScore(company, estimate) * 0.30 +
      moveTypeScore(company, estimate) * 0.25 +
      scheduleScore(company, estimate) * 0.20 +
      vehicleScore(company, estimate) * 0.15 +
      (company.avg_rating / 5.0) * 0.10,
    breakdown: { /* ... */ },
  }));

  // Step 4: 최고 점수 업체 매칭
  scored.sort((a, b) => b.totalScore - a.totalScore);
  const bestMatch = scored[0];

  if (!bestMatch) {
    // 매칭 실패 → 관리자 알림
    await notifyAdmin(estimateId, 'no_candidates');
    return;
  }

  // Step 5: 매칭 기록 생성 + 알림
  await createMatching(estimateId, bestMatch.companyId, bestMatch);
  await sendNotification(bestMatch.companyId, estimateId);
}
```

---

## 5. DB 스키마 요약

### 5.1 핵심 테이블

```
profiles ──┬── estimates ──── matchings ──── reviews
           │                     │
           └── companies ────────┘
```

### 5.2 테이블 정의

| 테이블 | 설명 | 핵심 컬럼 |
|--------|------|-----------|
| **profiles** | 사용자 | id (UUID), role (customer/company/admin), name, phone |
| **companies** | 업체 | user_id, business_name, service_regions[], move_types[], avg_rating |
| **estimates** | 견적 요청 | user_id, `schema_data` (JSONB, Input Schema v2.0 전체), status, completion_rate |
| **matchings** | 매칭 이력 | estimate_id, company_id, status, match_score, expires_at |
| **reviews** | 리뷰 | matching_id, rating (1~5), comment |
| **chat_messages** | 채팅 이력 | estimate_id, role (user/ai), content |

### 5.3 estimates.schema_data (JSONB)

```sql
-- Input Schema v2.0 전체를 JSONB로 저장
-- → 스키마 변경 시 DB 마이그레이션 불필요 (유연성)
CREATE TABLE estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  schema_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  completion_rate FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 매칭 필터링용 JSONB 인덱스
CREATE INDEX idx_est_category ON estimates ((schema_data->'move'->>'category'));
CREATE INDEX idx_est_type ON estimates ((schema_data->'move'->>'type'));
CREATE INDEX idx_est_status ON estimates (status);
```

### 5.4 RLS 정책

```sql
-- 고객: 자신의 견적만
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_estimates" ON estimates
  FOR ALL USING (user_id = auth.uid());

-- 업체: 매칭된 견적만 읽기
CREATE POLICY "matched_estimates" ON estimates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM matchings m
            JOIN companies c ON m.company_id = c.id
            WHERE m.estimate_id = estimates.id
            AND c.user_id = auth.uid())
  );

-- 관리자: 전체 접근
CREATE POLICY "admin_access" ON estimates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 6. 인증 설계

### 6.1 역할별 인증

| 역할 | 인증 방식 | 비고 |
|------|-----------|------|
| **고객** | 카카오 OAuth / 전화번호 인증 | 진입 장벽 최소화 |
| **비회원** | SMS 인증만으로 견적 신청 가능 | **MVP 핵심** — 회원가입 불필요 |
| **업체** | 이메일 + 비밀번호 | 사업자 정보 등록 필요 |
| **관리자** | 이메일 + 비밀번호 + 2FA | 보안 강화 |

### 6.2 비회원 견적 신청 플로우

```
견적 페이지 진입 (로그인 불필요)
    → 채팅/폼으로 정보 입력
    → 연락처 입력 (이름 + 전화번호)
    → SMS 인증번호 발송 → 검증
    → 견적 제출 완료
    → 전화번호로 마이페이지 조회 가능
```

> 이사는 비반복 서비스이므로 회원가입 강제는 이탈률을 크게 높임

---

## 7. 모바일 퍼스트 UI 설계

### 7.1 반응형 레이아웃

```
[모바일 ~639px]                      [데스크톱 1024px~]
┌────────────────────┐              ┌──────────┬───────────┐
│ 진행률 바 (35%)     │              │ 진행률 바              │
├────────────────────┤              ├──────────┼───────────┤
│                    │              │          │           │
│   채팅 영역         │              │  채팅     │   폼      │
│   (또는 폼 영역)    │              │  영역     │   영역    │
│                    │              │  (45%)   │  (55%)    │
│                    │              │          │           │
├────────────────────┤              │          │           │
│ [💬 채팅] [📋 폼]  │ ← 탭 전환    │          │           │
├────────────────────┤              ├──────────┴───────────┤
│   [견적 신청하기]   │ ← 고정 CTA   │    [견적 신청하기]     │
└────────────────────┘              └──────────────────────┘
```

### 7.2 PWA 설정

```json
{
  "name": "이사매칭 - AI 이사 견적",
  "short_name": "이사매칭",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563EB",
  "background_color": "#ffffff"
}
```

---

## 8. 외부 서비스 & 비용

### 8.1 월 운영 비용 추정

#### MVP 초기 (일 10~50건)

| 항목 | 서비스 | 플랜 | 월 비용 |
|------|--------|------|---------|
| 호스팅 | Vercel | Hobby (무료) | **$0** |
| BaaS | Supabase | Free | **$0** |
| AI | Gemini 2.5 Flash | 무료 티어 | **$0** |
| SMS | Solapi | 종량제 (50건/일 × 30일 × 15원) | **~₩22,500** |
| 주소 API | 카카오 | 무료 | **$0** |
| 도메인 | .kr | 연간 | ~₩20,000/년 |
| **합계** | | | **~₩25,000/월 (~$18)** |

#### 성장기 (일 200건)

| 항목 | 서비스 | 플랜 | 월 비용 |
|------|--------|------|---------|
| 호스팅 | Vercel | Pro | **$20** |
| BaaS | Supabase | Pro | **$25** |
| AI | Gemini 2.5 Flash | 유료 전환 | **~$1** |
| SMS | Solapi | 종량제 | **~₩90,000 (~$65)** |
| **합계** | | | **~$111/월** |

### 8.2 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini
GEMINI_API_KEY=

# 카카오
NEXT_PUBLIC_KAKAO_JS_KEY=
KAKAO_REST_API_KEY=

# SMS
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_SENDER=
```

---

## 9. 보안 체크리스트

| 항목 | 구현 | 시점 |
|------|------|------|
| HTTPS | Vercel 기본 제공 | ✅ MVP |
| RLS (Row Level Security) | Supabase 테이블별 정책 | ✅ MVP |
| API Key 서버사이드 | Gemini/SMS 키는 Edge Function에서만 사용 | ✅ MVP |
| 입력 검증 | Zod 스키마 (클라이언트 + 서버 양쪽) | ✅ MVP |
| 전화번호 마스킹 | 업체에게 전체 번호 노출 제한 | ✅ MVP |
| 개인정보 동의 | 약관 동의 UI + DB 기록 | ✅ MVP |
| Rate Limiting | Vercel/Supabase 기본 + 커스텀 | ✅ MVP |
| 2FA (관리자) | Supabase Auth MFA | Phase 2 |

---

## 10. 확장 경로

### 10.1 Flutter 앱 전환 시

```
공유 가능 (변경 없음):
├── Supabase 백엔드 전체 (DB, Auth, Edge Functions, Realtime)
├── Input Schema v2.0 (Dart 타입으로 변환)
├── 매칭 알고리즘 (Edge Function)
└── 외부 API 연동 (Gemini, SMS)

새로 개발:
├── Flutter UI (고객용 앱)
└── 네이티브 Push (FCM)

유지:
└── Next.js 관리자 대시보드 (웹 유지)
```

### 10.2 AI 엔진 업그레이드 경로

```
[MVP]     Gemini 2.5 Flash (무료)     — 기본 파싱
    ↓ 정확도 부족 시
[Phase 2] Gemini 2.5 Pro ($1.25/1M)   — 복잡한 파싱
          또는 Claude Haiku ($1/1M)    — 한국어 정확도
    ↓ 고도화 시
[Phase 3] Claude Sonnet ($3/1M)        — 매칭 최적화에 활용
```

---

## 11. 주차별 개발 계획 (기술 관점)

| 주차 | 프론트엔드 | 백엔드 (Supabase) | AI |
|------|-----------|-------------------|-----|
| **W1** | Next.js 세팅, Tailwind/shadcn | DB 마이그레이션, Auth (카카오) | — |
| **W2** | 견적 폼 UI (모바일 퍼스트) | estimates 테이블, RLS | — |
| **W3** | 채팅 UI + 폼 동기화 | 카카오 주소 연동, Edge Fn 배포 | Gemini 연동, 프롬프트 작성 |
| **W4** | 진행률 바, 확인/제출 페이지 | chat_messages, 자동 저장 | 파싱 정확도 테스트 & 튜닝 |
| **W5** | 업체 가입, 프로필, 대시보드 | companies, matchings 테이블 | 매칭 알고리즘 v1 |
| **W6** | 매칭 알림 UI, 수락/거절 | SMS 발송, Realtime, 타임아웃 | — |
| **W7** | 관리자 대시보드 | 정산 기본, 통계 쿼리 | — |
| **W8** | QA, PWA, 버그 수정 | 보안 점검, 성능 최적화 | 프롬프트 최종 튜닝 |
