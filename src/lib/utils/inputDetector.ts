/**
 * Input Detector
 *
 * 사용자 입력이 AI 파싱이 필요한지 판단하는 유틸리티
 * AI 비용 최소화를 위해 단순 입력은 로컬에서 처리
 */

import type { GuidedStep } from '@/lib/guided-flow/steps';

// 이사 관련 키워드 목록
const MOVING_KEYWORDS = [
  // 이사 유형
  '이사', '용달', '포장', '반포장', '보관',
  // 주거 형태
  '원룸', '투룸', '쓰리룸', '오피스텔', '아파트', '빌라', '주택', '사무실',
  // 위치
  '에서', '으로', '까지', '층', '평',
  // 날짜
  '월', '일', '주', '내일', '모레', '다음', '이번',
  // 시간
  '오전', '오후', '아침', '점심', '저녁',
  // 기타
  '짐', '가전', '가구', '냉장고', '세탁기', '침대', '옷장',
];

// 단순 숫자 패턴
const SIMPLE_NUMBER_PATTERN = /^[\d\s]+$/;

// 단순 예/아니오 패턴
const YES_NO_PATTERNS = [
  /^(네|예|응|맞아|그래|좋아|ㅇㅇ|ok|yes)$/i,
  /^(아니|아뇨|노|안|ㄴㄴ|no|nope)$/i,
];

// 선택지 매칭 패턴 (버튼 옵션과 정확히 일치)
const OPTION_MATCH_THRESHOLD = 0.8;

/**
 * 사용자 입력이 AI 파싱이 필요한지 판단
 *
 * @param userInput 사용자 입력 텍스트
 * @param currentStep 현재 가이드 스텝 (옵션)
 * @returns AI 호출 필요 여부
 */
export function shouldCallAI(
  userInput: string,
  currentStep?: GuidedStep | null
): boolean {
  const trimmed = userInput.trim();

  // 1. 빈 입력 → AI 불필요
  if (!trimmed) {
    return false;
  }

  // 2. 5자 미만의 짧은 입력 → AI 불필요 (대부분 단순 응답)
  if (trimmed.length < 5) {
    return false;
  }

  // 3. 단순 숫자만 있는 경우 → AI 불필요
  if (SIMPLE_NUMBER_PATTERN.test(trimmed)) {
    return false;
  }

  // 4. 예/아니오 패턴 → AI 불필요
  if (YES_NO_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return false;
  }

  // 5. 현재 스텝의 옵션과 정확히 매칭되는 경우 → AI 불필요
  if (currentStep?.options) {
    const matchesOption = currentStep.options.some((opt) => {
      const optLabel = opt.label.toLowerCase();
      const input = trimmed.toLowerCase();
      // 정확 매칭 또는 유사도 높은 매칭
      return (
        optLabel === input ||
        optLabel.includes(input) ||
        input.includes(optLabel)
      );
    });
    if (matchesOption) {
      return false;
    }
  }

  // 6. 이사 관련 키워드가 2개 이상 포함된 경우 → AI 필요
  const keywordCount = countKeywords(trimmed, MOVING_KEYWORDS);
  if (keywordCount >= 2) {
    return true;
  }

  // 7. 20자 이상이고 키워드가 1개 이상인 경우 → AI 필요
  if (trimmed.length >= 20 && keywordCount >= 1) {
    return true;
  }

  // 8. 30자 이상의 긴 입력 → AI 필요 (복합 정보 가능성)
  if (trimmed.length >= 30) {
    return true;
  }

  // 기본적으로 AI 불필요
  return false;
}

/**
 * 텍스트에서 키워드 개수 카운트
 */
function countKeywords(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  ).length;
}

/**
 * 입력이 특정 스텝의 답변으로 적합한지 판단
 */
export function isValidStepAnswer(
  userInput: string,
  step: GuidedStep
): boolean {
  const trimmed = userInput.trim();

  switch (step.inputType) {
    case 'calendar':
      // 날짜 형식 검증
      return isValidDate(trimmed);

    case 'number':
      // 숫자 검증
      return !isNaN(parseInt(trimmed));

    case 'button_list':
    case 'card':
      // 옵션 매칭
      if (step.options) {
        return step.options.some((opt) => {
          const optValue = String(opt.value).toLowerCase();
          const optLabel = opt.label.toLowerCase();
          const input = trimmed.toLowerCase();
          return optValue === input || optLabel === input;
        });
      }
      return false;

    case 'address':
      // 주소 형식 (기본 검증)
      return trimmed.length >= 5;

    case 'text':
    case 'toggle_list':
    case 'select':
      // 텍스트/선택은 대부분 유효
      return trimmed.length > 0;

    case 'phone_verify':
      // 전화번호 형식
      return isValidPhone(trimmed);

    default:
      return true;
  }
}

/**
 * 날짜 형식 검증
 */
function isValidDate(text: string): boolean {
  // YYYY-MM-DD 형식
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return !isNaN(Date.parse(text));
  }
  // 상대적 날짜 표현 (AI 파싱 필요)
  const dateKeywords = [
    '월', '일', '다음', '이번', '내일', '모레', '주말', '토', '일요일',
  ];
  return dateKeywords.some((k) => text.includes(k));
}

/**
 * 전화번호 형식 검증
 */
function isValidPhone(text: string): boolean {
  const digits = text.replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * 입력에서 의도 추론
 */
export function inferIntent(
  userInput: string
): 'answer' | 'question' | 'command' | 'unknown' {
  const trimmed = userInput.trim().toLowerCase();

  // 질문 패턴
  if (
    trimmed.endsWith('?') ||
    trimmed.includes('뭐') ||
    trimmed.includes('어떻게') ||
    trimmed.includes('왜')
  ) {
    return 'question';
  }

  // 명령 패턴
  if (
    trimmed.startsWith('다시') ||
    trimmed.startsWith('취소') ||
    trimmed.startsWith('수정')
  ) {
    return 'command';
  }

  // 기본은 답변
  return 'answer';
}
