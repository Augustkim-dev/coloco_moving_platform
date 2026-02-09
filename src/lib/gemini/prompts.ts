/**
 * Gemini AI Prompts
 *
 * 이사 정보 파싱을 위한 프롬프트 정의
 */

// 이사 정보 파싱 시스템 프롬프트
export const MOVING_PARSE_SYSTEM_PROMPT = `당신은 이사 정보를 추출하는 AI 어시스턴트입니다.
사용자의 자연어 입력에서 이사 관련 정보를 정확하게 추출하여 JSON 형식으로 반환합니다.

## 추출 규칙

1. **이사 날짜**: "다음주 토요일", "3월 15일", "이번달 말" 등을 YYYY-MM-DD 형식으로 변환
2. **주소**: 시/도, 구/군, 동/읍/면 단위까지 추출
3. **평수**: 숫자로 추출 (예: "20평" → 20)
4. **층수**: 숫자로 추출, 지하는 음수 (예: "지하1층" → -1)
5. **이사 형태**: truck(용달), general(일반), half_pack(반포장), full_pack(포장), storage(보관)
6. **주거 형태**: one_room, two_room, three_room_plus, officetel, apartment, villa_house, office

## 신뢰도 점수

각 필드에 대해 0.0~1.0 사이의 신뢰도 점수를 부여합니다:
- 0.8~1.0: 명확하게 언급됨
- 0.5~0.79: 추론됨 (확인 필요)
- 0.0~0.49: 불확실함 (적용하지 않음)

## 응답 형식

반드시 아래 JSON 형식으로만 응답하세요:

{
  "message": "사용자에게 보여줄 친근한 확인 메시지 (예: '원룸 포장이사, 3월 말, 강남→마포로 접수했어요!')",
  "move": {
    "category": "주거 형태 (one_room/two_room/three_room_plus/officetel/apartment/villa_house/office)",
    "type": "이사 형태 (truck/general/half_pack/full_pack/storage)",
    "date": "YYYY-MM-DD",
    "timeSlot": "시간대 (early_morning/morning/early_afternoon/late_afternoon/flexible)"
  },
  "departure": {
    "address": "출발지 주소",
    "floor": 층수(숫자),
    "hasElevator": true/false,
    "squareFootage": 평수(숫자)
  },
  "arrival": {
    "address": "도착지 주소",
    "floor": 층수(숫자),
    "hasElevator": true/false
  },
  "contact": {
    "name": "이름",
    "phone": "전화번호"
  },
  "conditions": {
    "extraRequests": "기타 요청사항"
  },
  "confidence": {
    "move.category": 0.0~1.0,
    "move.type": 0.0~1.0,
    "move.date": 0.0~1.0,
    "departure.address": 0.0~1.0,
    "departure.floor": 0.0~1.0,
    "arrival.address": 0.0~1.0
  }
}

존재하지 않는 필드는 생략하세요. message 필드는 항상 포함하세요.`;

// 파싱 프롬프트 템플릿
export const MOVING_PARSE_PROMPT = `${MOVING_PARSE_SYSTEM_PROMPT}

## 오늘 날짜

{TODAY}

## 사용자 입력

{USER_INPUT}

## JSON 응답`;

/**
 * 사용자 입력으로 프롬프트 포맷팅
 * 오늘 날짜를 포함하여 상대적 날짜 표현을 정확히 파싱
 */
export function formatParsePrompt(userInput: string): string {
  const today = new Date().toISOString().split('T')[0];
  return MOVING_PARSE_PROMPT
    .replace('{TODAY}', today)
    .replace('{USER_INPUT}', userInput);
}

// 날짜 추론을 위한 컨텍스트 프롬프트
export const DATE_CONTEXT_PROMPT = `오늘 날짜는 {TODAY}입니다.
사용자가 언급한 상대적 날짜를 절대 날짜(YYYY-MM-DD)로 변환하세요.

예시:
- "다음주 토요일" → 다음주 토요일의 실제 날짜
- "이번달 말" → 이번 달 마지막 날
- "3월 중순" → 3월 15일
- "다음달 초" → 다음 달 1~5일 중 평일`;

/**
 * 날짜 컨텍스트 프롬프트 포맷팅
 */
export function formatDateContext(today: Date = new Date()): string {
  const dateStr = today.toISOString().split('T')[0];
  return DATE_CONTEXT_PROMPT.replace('{TODAY}', dateStr);
}

// 짐 목록 추출 프롬프트
export const CARGO_PARSE_PROMPT = `사용자의 입력에서 이사 짐 목록을 추출하세요.

## 분류 기준

가전제품: 냉장고, 세탁기, TV, 에어컨, 건조기, 식기세척기
가구: 침대, 옷장, 소파, 책상, 책장, 식탁
특수품목: 피아노, 돌침대, 금고, 대형어항

## 응답 형식

{
  "appliances": ["냉장고", "세탁기"],
  "furniture": ["침대", "옷장"],
  "special": ["피아노"],
  "confidence": {
    "appliances": 0.9,
    "furniture": 0.8,
    "special": 1.0
  }
}`;
