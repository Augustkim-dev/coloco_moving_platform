# 이삿짐 플랫폼 Input Schema (v2.1)

> 본 문서는 이삿짐 AI 매칭 중계 플랫폼에서 사용하는 **단일 입력 데이터 구조(Single Source of Truth)** 정의서이다.
> 채팅 입력, 폼 입력, AI 파싱 결과는 모두 본 Schema를 기준으로 저장·처리된다.
>
> **기준 문서:** PRD v1.2, 입력 전략 설계서 v1.1 (2026-02-06)
> **변경 이력:**
> - v1.0: 초안 (PRD v0.1 기준, 기본 구조 정의)
> - v2.0: PRD v1.1 기준 전면 개정 — 필드 확장, 부가서비스/연락처/매칭 섹션 추가, AI confidence 추적, 검증 규칙 정의
> - v2.1: 입력 전략 반영 — conditions에 vehiclePreference/customerParticipation 추가, source에 "guided" 추가, contact에 carrier 추가

---

## 1. Schema 설계 원칙

1. 모든 입력 필드는 JSON 기준으로 **단일 구조**로 관리한다.
2. AI 추론 값과 사용자 확정 값은 **source 필드**로 구분한다.
3. **"unknown" (모름/미정)** 상태를 명시적으로 허용한다.
4. 모바일 입력을 고려해 중첩 구조는 **최대 2단계**까지만 허용한다.
5. 각 필드에 **AI 추론 난이도**를 명시하여 질문 생성 우선순위에 활용한다.
6. 필드별 **confidence score**(0~1)를 추적하여 낮은 확신도 필드는 사용자 확인을 유도한다.

---

## 2. 최상위 구조

```json
{
  "meta": {},
  "move": {},
  "departure": {},
  "arrival": {},
  "cargo": {},
  "services": {},
  "conditions": { "extraRequests, vehiclePreference, customerParticipation" },
  "contact": {},
  "status": {}
}
```

| 섹션 | 설명 | v1.0 대비 변경 |
|------|------|----------------|
| meta | 요청 메타 정보 | 유지 |
| move | 이사 기본 정보 | housingType/moveType 옵션 확장 |
| departure | 출발지 정보 | location.from → departure로 분리, 평수·상세주소 추가 |
| arrival | 도착지 정보 | location.to → arrival로 분리, 평수·상세주소 추가 |
| cargo | 짐 정보 | items → cargo로 리네이밍, 수량 지원, 특수짐 확장 |
| services | 부가 서비스 | **신규** — 에어컨/청소/정리/보관/폐기 |
| conditions | 기타 조건 (짐 상세, 트럭, 작업인원) | v2.1 확장 |
| contact | 연락처 정보 | **신규** — 이름/연락처/선호시간 |
| status | 상태 관리 | confidence 추적 추가 |

---

## 3. Meta 정보

```json
{
  "meta": {
    "requestId": "uuid",
    "source": "guided | chat | form | mixed",
    "platform": "mobile | desktop",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "version": "2.0"
  }
}
```

| 필드 | 타입 | 설명 | v1.0 대비 |
|------|------|------|-----------|
| requestId | string (UUID) | 견적 요청 고유 ID | **신규** |
| source | enum | 입력 시작 경로 (guided/chat/form/mixed) | v2.1: "guided" 추가 |
| platform | enum | 접속 환경 | **신규** |
| createdAt | ISO-8601 | 최초 생성 시점 | 유지 |
| updatedAt | ISO-8601 | 마지막 수정 시점 | 유지 |
| version | string | 스키마 버전 | **신규** |

---

## 4. 이사 기본 정보 (move)

```json
{
  "move": {
    "category": "one_room | two_room | three_room_plus | officetel | apartment | villa_house | office | unknown",
    "type": "truck | general | half_pack | full_pack | storage | unknown",
    "schedule": {
      "dateType": "exact | range | unknown",
      "date": "YYYY-MM-DD | null",
      "dateFrom": "YYYY-MM-DD | null",
      "dateTo": "YYYY-MM-DD | null"
    },
    "timeSlot": "early_morning | morning | early_afternoon | late_afternoon | flexible | unknown"
  }
}
```

### 필드 상세

| 필드 | 필수 | AI 추론 | 설명 | v1.0 대비 |
|------|------|---------|------|-----------|
| category | ✅ | ⭐ 가능 | 공간 기준 분류 | housingType → category, 옵션 확장 |
| type | ✅ | ⭐ 가능 | 서비스 기준 분류 | moveType → type, storage 추가 |
| schedule.dateType | ✅ | ⚡ 부분 | 날짜 확정 여부 | 유지 |
| schedule.date | 조건부 | ⚡ 부분 | 확정 날짜 (dateType=exact일 때) | 유지 |
| schedule.dateFrom | 조건부 | ⚡ 부분 | 범위 시작 (dateType=range일 때) | from → dateFrom |
| schedule.dateTo | 조건부 | ⚡ 부분 | 범위 끝 (dateType=range일 때) | to → dateTo |
| timeSlot | ✅ | ⚡ 부분 | 희망 시간대 | **신규** |

### category 옵션 매핑

| 값 | 한국어 | PRD 매핑 |
|----|--------|----------|
| one_room | 원룸 | 원룸 |
| two_room | 투룸 | 투룸 |
| three_room_plus | 쓰리룸 이상 | 쓰리룸 이상 |
| officetel | 오피스텔 | 오피스텔 |
| apartment | 아파트 | 아파트 |
| villa_house | 빌라/주택 | 빌라/주택 |
| office | 사무실 | 사무실 |
| unknown | 모름 | — |

### type 옵션 매핑

| 값 | 한국어 | 포장 | 운반 | 정리 |
|----|--------|------|------|------|
| truck | 용달이사 | 고객 | 업체 | 고객 |
| general | 일반이사 | 고객 | 업체 | 고객 |
| half_pack | 반포장이사 | 부분 | 업체 | 부분 |
| full_pack | 포장이사 | 업체 | 업체 | 업체 |
| storage | 보관이사 | 업체 | 업체 | 업체 |
| unknown | 모름 | — | — | — |

### timeSlot 옵션 매핑

| 값 | 한국어 | 시간 범위 |
|----|--------|-----------|
| early_morning | 오전 (이른) | 06:00~09:00 |
| morning | 오전 | 09:00~12:00 |
| early_afternoon | 오후 (이른) | 12:00~15:00 |
| late_afternoon | 오후 (늦은) | 15:00~18:00 |
| flexible | 시간 협의 | — |
| unknown | 모름 | — |

---

## 5. 출발지 정보 (departure)

```json
{
  "departure": {
    "address": "string | null",
    "detailAddress": "string | null",
    "floor": "number | null",
    "floorStatus": "known | unknown",
    "hasElevator": "yes | no | unknown",
    "parking": "yes | no | unknown",
    "squareFootage": "under_10 | 10_15 | 15_25 | 25_35 | 35_45 | over_45 | unknown | null"
  }
}
```

### 필드 상세

| 필드 | 필수 | AI 추론 | 설명 | v1.0 대비 |
|------|------|---------|------|-----------|
| address | ✅ | ⭐ 가능 | 도로명/지번 주소 | 유지 |
| detailAddress | 선택 | ⭐ 가능 | 동/호수 등 상세 | **신규** |
| floor | ✅ | ❌ 어려움 | 층수 (숫자, -1=지하, 0=반지하) | 유지, 특수값 정의 |
| floorStatus | — | — | floor 입력 상태 | **신규** (unknown 허용) |
| hasElevator | ✅ | ⚡ 부분 | 엘리베이터 유무 | boolean → enum (unknown 추가) |
| parking | 선택 | ❌ 어려움 | 주차 가능 여부 | parkingAvailable → parking |
| squareFootage | ✅ | ⚡ 부분 | 평수 범위 | **신규** |

### floor 특수값

| 값 | 의미 |
|----|------|
| -1 | 지하 |
| 0 | 반지하 |
| 1~99 | 해당 층 |
| null + floorStatus="unknown" | 모름 |

### squareFootage 옵션 매핑

| 값 | 한국어 |
|----|--------|
| under_10 | 10평 이하 |
| 10_15 | 10~15평 |
| 15_25 | 15~25평 |
| 25_35 | 25~35평 |
| 35_45 | 35~45평 |
| over_45 | 45평 이상 |
| unknown | 모름 |

---

## 6. 도착지 정보 (arrival)

> 구조는 departure와 동일

```json
{
  "arrival": {
    "address": "string | null",
    "detailAddress": "string | null",
    "floor": "number | null",
    "floorStatus": "known | unknown",
    "hasElevator": "yes | no | unknown",
    "parking": "yes | no | unknown",
    "squareFootage": "under_10 | 10_15 | 15_25 | 25_35 | 35_45 | over_45 | unknown | null"
  }
}
```

| 필드 | 필수 | AI 추론 | v1.0 대비 |
|------|------|---------|-----------|
| address | ✅ | ⭐ 가능 | 유지 |
| detailAddress | 선택 | ⭐ 가능 | **신규** |
| floor | ✅ | ❌ 어려움 | 유지 |
| floorStatus | — | — | **신규** |
| hasElevator | ✅ | ⚡ 부분 | enum 변경 |
| parking | 선택 | ❌ 어려움 | enum 변경 |
| squareFootage | 선택 | ⚡ 부분 | **신규** |

---

## 7. 짐 정보 (cargo)

```json
{
  "cargo": {
    "appliances": {
      "refrigerator": { "has": false, "qty": 0, "note": "" },
      "washer": { "has": false, "qty": 0, "note": "" },
      "tv": { "has": false, "qty": 0, "note": "" },
      "airConditioner": { "has": false, "qty": 0, "note": "" },
      "dryer": { "has": false, "qty": 0, "note": "" },
      "dishwasher": { "has": false, "qty": 0, "note": "" }
    },
    "furniture": {
      "bed": { "has": false, "qty": 0, "note": "" },
      "wardrobe": { "has": false, "qty": 0, "note": "" },
      "sofa": { "has": false, "qty": 0, "note": "" },
      "desk": { "has": false, "qty": 0, "note": "" },
      "bookshelf": { "has": false, "qty": 0, "note": "" },
      "diningTable": { "has": false, "qty": 0, "note": "" }
    },
    "special": {
      "piano": { "has": false, "note": "" },
      "stoneBed": { "has": false, "note": "" },
      "safe": { "has": false, "note": "" },
      "aquarium": { "has": false, "note": "" },
      "custom": []
    },
    "boxes": {
      "range": "1_5 | 6_10 | 11_15 | 16_20 | over_20 | none | unknown",
      "exactCount": "number | null"
    }
  }
}
```

### v1.0 대비 주요 변경

| 변경점 | v1.0 | v2.0 |
|--------|------|------|
| 아이템 구조 | `boolean` | `{ has, qty, note }` 객체 |
| 가전 목록 | 4개 | 6개 (건조기, 식기세척기 추가) |
| 가구 목록 | 4개 | 6개 (책장, 식탁 추가) |
| 특수 짐 | 3개 | 4개 + custom 배열 |
| 박스 수 | count + status | range(범위 선택) + exactCount |

### cargo 아이템 객체 구조

```json
{
  "has": true,
  "qty": 1,
  "note": "킹사이즈"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| has | boolean | 보유 여부 |
| qty | number | 수량 (기본 0, has=true일 때 최소 1) |
| note | string | AI가 파싱한 부가 설명 ("킹사이즈", "양문형" 등) |

### special.custom 구조

```json
{
  "special": {
    "custom": [
      { "name": "수족관", "note": "대형 해수어" }
    ]
  }
}
```

> 사전 정의되지 않은 특수 짐은 custom 배열에 자유 추가

### boxes.range 옵션 매핑

| 값 | 한국어 |
|----|--------|
| 1_5 | 1~5개 |
| 6_10 | 6~10개 |
| 11_15 | 11~15개 |
| 16_20 | 16~20개 |
| over_20 | 20개 초과 |
| none | 잔짐 없음 |
| unknown | 모름 |

### 필드별 AI 추론 난이도

| 구분 | AI 추론 | 설명 |
|------|---------|------|
| appliances | ⭐ 가능 | "냉장고 있어요" → 직접 매핑 |
| furniture | ⭐ 가능 | "침대 2개" → has=true, qty=2 |
| special | ⭐ 가능 | "피아노 있어요" → 직접 매핑 |
| boxes | ⚡ 부분 | "박스 한 열개?" → range=6_10 (추정) |

---

## 8. 부가 서비스 (services) — 신규

```json
{
  "services": {
    "ladderTruck": "required | not_required | unknown",
    "airconInstall": { "needed": false, "qty": 0 },
    "cleaning": false,
    "organizing": false,
    "storage": { "needed": false, "durationDays": 0 },
    "disposal": false
  }
}
```

| 필드 | 타입 | 필수 | AI 추론 | 설명 |
|------|------|------|---------|------|
| ladderTruck | enum | 선택 | ⚡ 부분 | 사다리차 필요 여부 |
| airconInstall | object | 선택 | ⭐ 가능 | 에어컨 이전 설치 + 대수 |
| cleaning | boolean | 선택 | ⭐ 가능 | 입주 청소 |
| organizing | boolean | 선택 | ⭐ 가능 | 정리 정돈 |
| storage | object | 선택 | ⚡ 부분 | 보관 서비스 + 기간(일) |
| disposal | boolean | 선택 | ⭐ 가능 | 폐기물 처리 |

> **v1.0의 conditions.ladderTruck → services로 이동.** 사다리차는 부가 서비스 성격이므로 services 섹션이 적합.

---

## 9. 기타 조건 (conditions) — v2.1 확장

```json
{
  "conditions": {
    "extraRequests": "string | null",
    "vehiclePreference": "'1' | '2' | 'unknown' | null",
    "customerParticipation": "boolean | null"
  }
}
```

| 필드 | 필수 | AI 추론 | 비고 |
|------|------|---------|------|
| extraRequests | **필수** (v2.1) | ⭐ 가능 | 자세한 짐 양 + 요청사항 자유 텍스트. 추가금 분쟁 방지 |
| vehiclePreference | 선택 | ❌ 어려움 | 트럭 대수 ("1"/"2"/"unknown"). 용달/일반이사 시에만 |
| customerParticipation | 선택 | ❌ 어려움 | 고객 함께 작업 여부. 용달/일반이사 시에만 |

> **v2.1 변경:** vehiclePreference, customerParticipation 신규 추가 (짐싸만 UX 벤치마킹). extraRequests 선택→필수로 변경.

---

## 10. 연락처 정보 (contact) — v2.1 확장

```json
{
  "contact": {
    "name": "string | null",
    "phone": "string | null",
    "carrier": "string | null",
    "preferredTime": "anytime | morning | afternoon | evening | null"
  }
}
```

| 필드 | 필수 | AI 추론 | 설명 |
|------|------|---------|------|
| name | ✅ | ❌ 어려움 | 의뢰자 이름 |
| phone | ✅ | ❌ 어려움 | 휴대폰 번호 (SMS 인증 필수) |
| carrier | ✅ | ❌ 어려움 | 통신사 (본인인증 시 필요). SKT/KT/LGU+/알뜰폰 |
| preferredTime | 선택 | ⚡ 부분 | 연락 가능 시간대 |

### preferredTime 옵션

| 값 | 한국어 |
|----|--------|
| anytime | 언제든 |
| morning | 오전 |
| afternoon | 오후 |
| evening | 저녁 |

### 연락처 수집 정책

- 채팅 플로우에서는 **마지막 단계**에 수집 (다른 필수 필드 모두 완료 후)
- 폼 플로우에서는 **하단 섹션**에 배치
- AI가 자연어에서 이름/전화번호를 파싱하지 않음 (개인정보 보호)

---

## 11. 상태 관리 (status)

```json
{
  "status": {
    "completionRate": 0.0,
    "missingRequired": [
      {
        "field": "departure.floor",
        "priority": 1,
        "questionTemplate": "출발지 층수를 알려주세요"
      }
    ],
    "fieldConfidence": {
      "move.category": { "value": "one_room", "confidence": 0.95, "source": "chat" },
      "move.schedule.date": { "value": "2026-03-28", "confidence": 0.6, "source": "chat" },
      "departure.address": { "value": "서울 강남구 역삼동", "confidence": 0.8, "source": "chat" }
    },
    "readyForSubmit": false,
    "submittedAt": "ISO-8601 | null"
  }
}
```

### v1.0 대비 주요 변경

| 변경점 | v1.0 | v2.0 |
|--------|------|------|
| 누락 필드 | 문자열 배열 | 객체 배열 (우선순위 + 질문 템플릿 포함) |
| 확신도 | 없음 | fieldConfidence 맵 추가 |
| 제출 상태 | readyForQuote | readyForSubmit + submittedAt |

### missingRequired 객체 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| field | string | 누락된 필드의 dot notation 경로 |
| priority | number | 질문 우선순위 (1=최우선) |
| questionTemplate | string | AI 질문 생성 시 기본 템플릿 |

### priority 기준

| 순위 | 대상 필드 | 이유 |
|------|-----------|------|
| 1 | 위치 관련 (floor, elevator) | 비용 산정에 직접 영향 |
| 2 | 일정 (schedule) | 날짜가 범위인 경우 확정 필요 |
| 3 | 이사 분류 (category, type) | 매칭에 필수 |
| 4 | 연락처 (name, phone) | 제출 직전에 수집 |

### fieldConfidence 객체 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| value | any | 현재 값 |
| confidence | number (0~1) | AI 추론 확신도 |
| source | enum | 값의 출처 (guided / chat / form / system) |

### confidence 임계값 정책

| 범위 | 처리 방식 |
|------|-----------|
| 0.8 ~ 1.0 | 자동 반영, 사용자 확인 불필요 |
| 0.5 ~ 0.79 | 자동 반영 + "이 내용이 맞나요?" 확인 질문 |
| 0.0 ~ 0.49 | 반영하지 않음, 직접 질문 생성 |

---

## 12. 필수 필드 목록 (Summary)

```text
# 이사 기본 정보
- move.category
- move.type
- move.schedule (dateType + date 또는 dateFrom/dateTo)
- move.timeSlot

# 출발지
- departure.address
- departure.floor (또는 floorStatus=unknown)
- departure.hasElevator
- departure.squareFootage

# 도착지
- arrival.address
- arrival.floor (또는 floorStatus=unknown)
- arrival.hasElevator

# 연락처
- contact.name
- contact.phone
```

**총 필수 필드: 13개** → completionRate 계산의 분모

---

## 13. 질문 생성 정책

### 기본 규칙

| 규칙 | v1.0 | v2.0 |
|------|------|------|
| 질문 대상 | 필수 필드 null/unknown만 | 필수 null/unknown + 낮은 confidence |
| 질문 개수 | 한 번에 1개 | 한 번에 **2~3개** (관련 필드 묶음) |
| 선택 필드 | 질문 안 함 | 질문 안 함 (유지) |
| 연락처 | 규칙 없음 | **마지막에** 수집 |

### 질문 묶음 예시

| 묶음 | 포함 필드 | 예시 질문 |
|------|-----------|-----------|
| 출발지 상세 | floor + hasElevator + parking | "출발지 층수와 엘리베이터 유무를 알려주세요!" |
| 도착지 상세 | floor + hasElevator + parking | "도착지는 몇 층이고 엘리베이터가 있나요?" |
| 일정 확정 | schedule.date | "3월 말이시라고 하셨는데, 혹시 날짜가 정해지셨나요?" |
| 연락처 | name + phone | "마지막으로 이름과 연락처를 알려주시면 바로 견적 요청을 보내드릴게요!" |

---

## 14. AI 파싱 입출력 예시

### 입력 (자연어)

```
"원룸이고 3월 말에 강남에서 마포로 이사해요. 
 세탁기랑 킹사이즈 침대 있고 포장이사로 하고 싶어요"
```

### 출력 (Schema 적용)

```json
{
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "source": "chat",
    "platform": "mobile",
    "createdAt": "2026-02-06T14:30:00Z",
    "updatedAt": "2026-02-06T14:30:00Z",
    "version": "2.0"
  },
  "move": {
    "category": "one_room",
    "type": "full_pack",
    "schedule": {
      "dateType": "range",
      "date": null,
      "dateFrom": "2026-03-25",
      "dateTo": "2026-03-31"
    },
    "timeSlot": "unknown"
  },
  "departure": {
    "address": "서울 강남구",
    "detailAddress": null,
    "floor": null,
    "floorStatus": "unknown",
    "hasElevator": "unknown",
    "parking": "unknown",
    "squareFootage": null
  },
  "arrival": {
    "address": "서울 마포구",
    "detailAddress": null,
    "floor": null,
    "floorStatus": "unknown",
    "hasElevator": "unknown",
    "parking": "unknown",
    "squareFootage": null
  },
  "cargo": {
    "appliances": {
      "refrigerator": { "has": false, "qty": 0, "note": "" },
      "washer": { "has": true, "qty": 1, "note": "" },
      "tv": { "has": false, "qty": 0, "note": "" },
      "airConditioner": { "has": false, "qty": 0, "note": "" },
      "dryer": { "has": false, "qty": 0, "note": "" },
      "dishwasher": { "has": false, "qty": 0, "note": "" }
    },
    "furniture": {
      "bed": { "has": true, "qty": 1, "note": "킹사이즈" },
      "wardrobe": { "has": false, "qty": 0, "note": "" },
      "sofa": { "has": false, "qty": 0, "note": "" },
      "desk": { "has": false, "qty": 0, "note": "" },
      "bookshelf": { "has": false, "qty": 0, "note": "" },
      "diningTable": { "has": false, "qty": 0, "note": "" }
    },
    "special": {
      "piano": { "has": false, "note": "" },
      "stoneBed": { "has": false, "note": "" },
      "safe": { "has": false, "note": "" },
      "aquarium": { "has": false, "note": "" },
      "custom": []
    },
    "boxes": {
      "range": "unknown",
      "exactCount": null
    }
  },
  "services": {
    "ladderTruck": "unknown",
    "airconInstall": { "needed": false, "qty": 0 },
    "cleaning": false,
    "organizing": false,
    "storage": { "needed": false, "durationDays": 0 },
    "disposal": false
  },
  "conditions": {
    "extraRequests": null,
    "vehiclePreference": null,
    "customerParticipation": null
  },
  "contact": {
    "name": null,
    "phone": null,
    "carrier": null,
    "preferredTime": null
  },
  "status": {
    "completionRate": 0.31,
    "missingRequired": [
      { "field": "move.timeSlot", "priority": 3, "questionTemplate": "희망 시간대를 알려주세요" },
      { "field": "departure.floor", "priority": 1, "questionTemplate": "출발지 층수를 알려주세요" },
      { "field": "departure.hasElevator", "priority": 1, "questionTemplate": "출발지에 엘리베이터가 있나요?" },
      { "field": "departure.squareFootage", "priority": 2, "questionTemplate": "출발지 평수를 알려주세요" },
      { "field": "arrival.floor", "priority": 1, "questionTemplate": "도착지 층수를 알려주세요" },
      { "field": "arrival.hasElevator", "priority": 1, "questionTemplate": "도착지에 엘리베이터가 있나요?" },
      { "field": "contact.name", "priority": 4, "questionTemplate": "이름을 알려주세요" },
      { "field": "contact.phone", "priority": 4, "questionTemplate": "연락처를 알려주세요" }
    ],
    "fieldConfidence": {
      "move.category": { "value": "one_room", "confidence": 0.95, "source": "chat" },
      "move.type": { "value": "full_pack", "confidence": 0.95, "source": "chat" },
      "move.schedule": { "value": "range:03-25~03-31", "confidence": 0.6, "source": "chat" },
      "departure.address": { "value": "서울 강남구", "confidence": 0.75, "source": "chat" },
      "arrival.address": { "value": "서울 마포구", "confidence": 0.75, "source": "chat" },
      "cargo.appliances.washer": { "value": true, "confidence": 0.95, "source": "chat" },
      "cargo.furniture.bed": { "value": true, "confidence": 0.90, "source": "chat" }
    },
    "readyForSubmit": false,
    "submittedAt": null
  }
}
```

### 이 입력에 대한 AI 첫 응답

```
"원룸 포장이사, 3월 말경으로 접수했어요! 세탁기와 킹사이즈 침대도 기록했습니다 ✅

몇 가지만 더 확인할게요:
1. 출발지(강남) 몇 층이고 엘리베이터가 있나요?
2. 도착지(마포)도 층수와 엘리베이터 여부를 알려주세요!
3. 출발지 평수는 대략 어느 정도인가요?"
```

---

## 15. Validation 규칙

### 필드별 검증

| 필드 | 규칙 | 에러 메시지 |
|------|------|-------------|
| departure.address | 최소 2글자, 주소 API 검증 | "올바른 주소를 입력해주세요" |
| arrival.address | 최소 2글자, 주소 API 검증 | "올바른 주소를 입력해주세요" |
| departure.floor | -1 이상 99 이하 정수 | "층수는 지하~99층 사이로 입력해주세요" |
| contact.phone | 한국 휴대폰 정규식 `^01[016789]-?\d{3,4}-?\d{4}$` | "올바른 휴대폰 번호를 입력해주세요" |
| contact.name | 1~20자, 특수문자 불가 | "이름을 확인해주세요" |
| move.schedule.date | 오늘 이후 날짜 | "이사 날짜는 오늘 이후여야 합니다" |
| cargo.*.qty | 0 이상 정수 | — |
| services.storage.durationDays | 0 이상 정수 | — |

### 제출 전 최종 검증

```
readyForSubmit = true 조건:
  1. missingRequired 배열이 비어있거나 priority 4(연락처)만 남은 상태가 아님
     → 모든 priority 1~3 필수 필드 완료
     → 연락처(priority 4)도 완료
  2. contact.name이 유효
  3. contact.phone이 유효
  4. move.schedule이 유효한 날짜
```

---

## 16. 확장 예정 필드 (v2.1+)

| 필드 | 섹션 | 설명 | 시점 |
|------|------|------|------|
| estimatedVolume | cargo | 추정 물량 (톤) | Phase 2 |
| preferredBudget | move | 희망 예산 범위 | Phase 2 |
| insuranceRequired | services | 보험 가입 희망 | Phase 2 |
| photos | cargo | 짐 사진 업로드 | Phase 2 |
| previousMoveId | meta | 재이사 시 이전 기록 참조 | Phase 3 |
| companyNotes | meta | 업체 전용 메모 | Phase 2 |

---

## 17. TypeScript 타입 정의 (참고)

```typescript
// 주요 enum 타입
type MoveCategory = 'one_room' | 'two_room' | 'three_room_plus' | 'officetel' | 'apartment' | 'villa_house' | 'office' | 'unknown';
type MoveType = 'truck' | 'general' | 'half_pack' | 'full_pack' | 'storage' | 'unknown';
type DateType = 'exact' | 'range' | 'unknown';
type TimeSlot = 'early_morning' | 'morning' | 'early_afternoon' | 'late_afternoon' | 'flexible' | 'unknown';
type YesNoUnknown = 'yes' | 'no' | 'unknown';
type SquareFootage = 'under_10' | '10_15' | '15_25' | '25_35' | '35_45' | 'over_45' | 'unknown';
type BoxRange = '1_5' | '6_10' | '11_15' | '16_20' | 'over_20' | 'none' | 'unknown';
type LadderTruck = 'required' | 'not_required' | 'unknown';
type ContactTime = 'anytime' | 'morning' | 'afternoon' | 'evening';
type InputSource = 'chat' | 'form' | 'mixed';
type Platform = 'mobile' | 'desktop';
type ConfidenceSource = 'chat' | 'form' | 'system';

// 아이템 객체
interface CargoItem {
  has: boolean;
  qty: number;
  note: string;
}

interface SpecialItem {
  has: boolean;
  note: string;
}

interface CustomSpecialItem {
  name: string;
  note: string;
}

// 필드 확신도
interface FieldConfidence {
  value: any;
  confidence: number; // 0~1
  source: ConfidenceSource;
}

// 누락 필드
interface MissingField {
  field: string;
  priority: number; // 1=최우선, 4=최후
  questionTemplate: string;
}
```

> 전체 TypeScript 인터페이스는 개발 착수 시 별도 `.d.ts` 파일로 생성 권장
