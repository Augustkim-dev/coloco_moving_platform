/**
 * 가이드 대화 시스템 - Step 정의
 *
 * 15개의 질문 Step과 조건부 스킵 로직, TipCard 정의
 */

import type { MovingSchema } from '@/types/schema';

// ============================================
// Step 관련 타입 정의
// ============================================

/** Step 옵션 (버튼, 카드 선택지) */
export interface StepOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  tags?: string[];
}

/** 팁 카드 */
export interface TipCard {
  id: string;
  badge: string;
  badgeColor: 'blue' | 'yellow' | 'green' | 'orange';
  illustration?: string;
  title: string;
  description: string;
}

/** 입력 UI 타입 */
export type StepInputType =
  | 'calendar'       // 날짜 선택
  | 'select'         // 드롭다운/범위 선택
  | 'card'           // 카드형 선택
  | 'button_list'    // 버튼 리스트
  | 'address'        // 주소 검색
  | 'number'         // 숫자 입력
  | 'toggle_list'    // 토글 리스트
  | 'text'           // 텍스트 입력
  | 'phone_verify';  // SMS 인증

/** 가이드 Step 정의 */
export interface GuidedStep {
  id: string;
  stepNumber: number;
  question: string;
  description?: string;
  inputType: StepInputType;
  options?: StepOption[];
  schemaPath: string;
  required: boolean;
  tipCard?: TipCard;
  helpLink?: { label: string; url: string };
  placeholder?: string;
  /** 이 Step을 스킵할 조건 (true 반환 시 스킵) */
  skipCondition?: (schema: MovingSchema) => boolean;
  /** 답변을 스키마에 적용하는 변환 함수 */
  transform?: (value: unknown, schema: MovingSchema) => Partial<MovingSchema>;
}

// ============================================
// 팁 카드 정의
// ============================================

export const TIP_CARDS: Record<string, TipCard> = {
  peak_season: {
    id: 'peak_season',
    badge: '성수기 안내',
    badgeColor: 'yellow',
    illustration: '/tips/peak-season.svg',
    title: '이 날짜는 이사 성수기예요',
    description: '금요일·주말·공휴일 전날은 평일 대비 20~30% 비쌀 수 있어요',
  },
  truck_count: {
    id: 'truck_count',
    badge: '트럭 선택 팁',
    badgeColor: 'blue',
    illustration: '/tips/truck-guide.svg',
    title: '아래 가구가 3개 이상이라면 2대가 적당해요',
    description: '양문형 냉장고 / 옷장 / 더블 이상 침대 / 3인용 소파 중 3개',
  },
  worker_participation: {
    id: 'worker_participation',
    badge: '작업인원 팁',
    badgeColor: 'green',
    illustration: '/tips/worker-guide.svg',
    title: '무거운 짐을 함께 옮길 수 있다면 약 13만원 저렴해요',
    description: '냉장고, 옷장, 침대, 소파 등',
  },
  ladder_truck: {
    id: 'ladder_truck',
    badge: '사다리차 안내',
    badgeColor: 'orange',
    illustration: '/tips/ladder-guide.svg',
    title: '3층 이상이고 엘리베이터가 없으면 사다리차를 추천해요',
    description: '사다리차 비용: 5~15만원',
  },
};

// ============================================
// 15개 가이드 Step 정의
// ============================================

export const GUIDED_STEPS: GuidedStep[] = [
  // Step 1: 이사 예정일
  {
    id: 'move_date',
    stepNumber: 1,
    question: '이사 예정일이 언제인가요?',
    description: '날짜가 확정되지 않았다면 대략적인 기간을 선택해주세요',
    inputType: 'calendar',
    schemaPath: 'move.schedule',
    required: true,
    tipCard: TIP_CARDS.peak_season,
  },

  // Step 2: 현재 평수
  {
    id: 'square_footage',
    stepNumber: 2,
    question: '현재 살고 계신 곳의 평수는 어떻게 되나요?',
    inputType: 'select',
    options: [
      { label: '10평 이하', value: 'under_10' },
      { label: '10~15평', value: '10_15' },
      { label: '15~25평', value: '15_25' },
      { label: '25~35평', value: '25_35' },
      { label: '35~45평', value: '35_45' },
      { label: '45평 이상', value: 'over_45' },
      { label: '모르겠어요', value: 'unknown' },
    ],
    schemaPath: 'departure.squareFootage',
    required: true,
  },

  // Step 3: 이사 형태
  {
    id: 'move_type',
    stepNumber: 3,
    question: '어떤 이사를 원하시나요?',
    description: '서비스 범위에 따라 가격이 달라져요',
    inputType: 'card',
    options: [
      {
        label: '용달이사',
        value: 'truck',
        description: '운반만 해드려요. 짐 포장과 정리는 직접 해야 해요',
        tags: ['가장 저렴'],
      },
      {
        label: '일반이사',
        value: 'general',
        description: '운반 + 큰 가구 배치까지 해드려요',
        tags: ['인기'],
      },
      {
        label: '반포장이사',
        value: 'half_pack',
        description: '큰 짐은 포장해드리고, 잔짐은 직접 포장해주세요',
        tags: [],
      },
      {
        label: '포장이사',
        value: 'full_pack',
        description: '포장, 운반, 정리 모두 해드려요',
        tags: ['프리미엄'],
      },
    ],
    schemaPath: 'move.type',
    required: true,
  },

  // Step 4: 시작 시간
  {
    id: 'time_slot',
    stepNumber: 4,
    question: '이사 시작 시간대를 선택해주세요',
    inputType: 'button_list',
    options: [
      { label: '오전 (이른) 06~09시', value: 'early_morning' },
      { label: '오전 09~12시', value: 'morning' },
      { label: '오후 (이른) 12~15시', value: 'early_afternoon' },
      { label: '오후 (늦은) 15~18시', value: 'late_afternoon' },
      { label: '시간 협의', value: 'flexible' },
    ],
    schemaPath: 'move.timeSlot',
    required: true,
  },

  // Step 5: 출발지 주소
  {
    id: 'departure_address',
    stepNumber: 5,
    question: '출발지 주소를 알려주세요',
    description: '짐을 가져갈 현재 주소예요',
    inputType: 'address',
    schemaPath: 'departure.address',
    required: true,
    placeholder: '주소 검색 (예: 강남구 역삼동)',
  },

  // Step 6: 출발지 운반 방식
  {
    id: 'departure_elevator',
    stepNumber: 6,
    question: '출발지에서 짐을 어떻게 운반하나요?',
    inputType: 'button_list',
    options: [
      { label: '엘리베이터', value: 'yes', description: '엘리베이터로 운반' },
      { label: '계단', value: 'no', description: '계단으로 운반' },
      { label: '사다리차', value: 'ladder', description: '사다리차 필요' },
    ],
    schemaPath: 'departure.hasElevator',
    required: true,
    tipCard: TIP_CARDS.ladder_truck,
    transform: (value, schema) => {
      const updates: Partial<MovingSchema> = {
        departure: {
          ...schema.departure,
          hasElevator: value === 'ladder' ? 'no' : (value as 'yes' | 'no'),
        },
      };
      if (value === 'ladder') {
        updates.services = {
          ...schema.services,
          ladderTruck: 'required',
        };
      }
      return updates;
    },
  },

  // Step 7: 출발지 층수
  {
    id: 'departure_floor',
    stepNumber: 7,
    question: '출발지는 몇 층인가요?',
    description: '지하는 -1, 반지하는 0으로 입력해주세요',
    inputType: 'number',
    schemaPath: 'departure.floor',
    required: true,
    placeholder: '층수 입력',
  },

  // Step 8: 도착지 주소
  {
    id: 'arrival_address',
    stepNumber: 8,
    question: '도착지 주소를 알려주세요',
    description: '짐을 옮길 새 주소예요',
    inputType: 'address',
    schemaPath: 'arrival.address',
    required: true,
    placeholder: '주소 검색 (예: 마포구 합정동)',
  },

  // Step 9: 도착지 운반 방식
  {
    id: 'arrival_elevator',
    stepNumber: 9,
    question: '도착지에서 짐을 어떻게 운반하나요?',
    inputType: 'button_list',
    options: [
      { label: '엘리베이터', value: 'yes', description: '엘리베이터로 운반' },
      { label: '계단', value: 'no', description: '계단으로 운반' },
      { label: '사다리차', value: 'ladder', description: '사다리차 필요' },
    ],
    schemaPath: 'arrival.hasElevator',
    required: true,
    transform: (value, schema) => {
      const updates: Partial<MovingSchema> = {
        arrival: {
          ...schema.arrival,
          hasElevator: value === 'ladder' ? 'no' : (value as 'yes' | 'no'),
        },
      };
      if (value === 'ladder' && schema.services.ladderTruck !== 'required') {
        updates.services = {
          ...schema.services,
          ladderTruck: 'required',
        };
      }
      return updates;
    },
  },

  // Step 10: 도착지 층수
  {
    id: 'arrival_floor',
    stepNumber: 10,
    question: '도착지는 몇 층인가요?',
    description: '지하는 -1, 반지하는 0으로 입력해주세요',
    inputType: 'number',
    schemaPath: 'arrival.floor',
    required: true,
    placeholder: '층수 입력',
  },

  // Step 11: 트럭 대수 (용달/일반이사만)
  {
    id: 'vehicle_preference',
    stepNumber: 11,
    question: '트럭은 몇 대가 필요하실까요?',
    description: '짐 양에 따라 선택해주세요',
    inputType: 'button_list',
    options: [
      { label: '1대', value: '1' },
      { label: '2대', value: '2' },
      { label: '모르겠어요', value: 'unknown' },
    ],
    schemaPath: 'conditions.vehiclePreference',
    required: false,
    tipCard: TIP_CARDS.truck_count,
    skipCondition: (schema) =>
      schema.move.type === 'full_pack' ||
      schema.move.type === 'half_pack' ||
      schema.move.type === 'storage',
  },

  // Step 12: 작업인원 (용달/일반이사만)
  {
    id: 'customer_participation',
    stepNumber: 12,
    question: '짐 운반을 함께 도와주실 수 있나요?',
    description: '무거운 가구를 함께 옮기면 비용이 절약돼요',
    inputType: 'button_list',
    options: [
      { label: '네, 함께 할게요', value: 'true' },
      { label: '아니요, 업체분만 작업해요', value: 'false' },
    ],
    schemaPath: 'conditions.customerParticipation',
    required: false,
    tipCard: TIP_CARDS.worker_participation,
    skipCondition: (schema) =>
      schema.move.type === 'full_pack' ||
      schema.move.type === 'half_pack' ||
      schema.move.type === 'storage',
    transform: (value) => ({
      conditions: {
        customerParticipation: value === 'true',
        extraRequests: null,
        vehiclePreference: null,
      },
    }),
  },

  // Step 13: 짐 상세 & 요청사항
  {
    id: 'extra_requests',
    stepNumber: 13,
    question: '짐 정보나 요청사항을 자유롭게 적어주세요',
    description: '냉장고, 세탁기, 침대 등 주요 짐과 특별히 조심해야 할 물건이 있다면 알려주세요',
    inputType: 'text',
    schemaPath: 'conditions.extraRequests',
    required: true,
    placeholder: '예: 냉장고 양문형 1대, 드럼세탁기 1대, 퀸침대 1개 있어요. 피아노는 따로 문의드릴게요.',
  },

  // Step 14: 부가 서비스 (포장/반포장만)
  {
    id: 'additional_services',
    stepNumber: 14,
    question: '추가로 필요한 서비스가 있으신가요?',
    description: '선택하지 않아도 괜찮아요',
    inputType: 'toggle_list',
    options: [
      { label: '에어컨 이전 설치', value: 'airconInstall', description: '에어컨 이설 서비스' },
      { label: '입주 청소', value: 'cleaning', description: '새 집 입주 전 청소' },
      { label: '정리 정돈', value: 'organizing', description: '짐 정리 도움' },
      { label: '폐기물 처리', value: 'disposal', description: '버릴 가구/짐 처리' },
    ],
    schemaPath: 'services',
    required: false,
    skipCondition: (schema) => schema.move.type === 'truck',
  },

  // Step 15: 본인 인증
  {
    id: 'contact_verification',
    stepNumber: 15,
    question: '마지막으로 연락처를 확인해주세요',
    description: '견적을 받으실 연락처를 인증해주세요',
    inputType: 'phone_verify',
    schemaPath: 'contact',
    required: true,
  },
];

// ============================================
// 유틸리티 함수
// ============================================

/** Step ID로 Step 찾기 */
export function getStepById(stepId: string): GuidedStep | undefined {
  return GUIDED_STEPS.find((step) => step.id === stepId);
}

/** Step 번호로 Step 찾기 */
export function getStepByNumber(stepNumber: number): GuidedStep | undefined {
  return GUIDED_STEPS.find((step) => step.stepNumber === stepNumber);
}

/** 스킵되지 않는 Step 목록 반환 */
export function getActiveSteps(schema: MovingSchema): GuidedStep[] {
  return GUIDED_STEPS.filter(
    (step) => !step.skipCondition || !step.skipCondition(schema)
  );
}

/** 전체 Step 수 (스킵 제외) */
export function getTotalActiveSteps(schema: MovingSchema): number {
  return getActiveSteps(schema).length;
}

/** 현재 진행률 계산 (완료된 Step / 전체 활성 Step) */
export function calculateProgress(
  completedStepIds: Set<string>,
  schema: MovingSchema
): number {
  const activeSteps = getActiveSteps(schema);
  const completedCount = activeSteps.filter((step) =>
    completedStepIds.has(step.id)
  ).length;
  return activeSteps.length > 0 ? completedCount / activeSteps.length : 0;
}
