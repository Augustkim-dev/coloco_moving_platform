/**
 * 이삿짐 플랫폼 Input Schema v2.1
 *
 * 채팅 입력, 폼 입력, AI 파싱 결과가 모두 이 스키마를 기준으로 저장/처리됨
 * Single Source of Truth
 */

// ============================================
// Enum 타입 정의
// ============================================

/** 이사 종류 (주거 공간 기준) */
export type MoveCategory =
  | 'one_room'        // 원룸
  | 'two_room'        // 투룸
  | 'three_room_plus' // 쓰리룸 이상
  | 'officetel'       // 오피스텔
  | 'apartment'       // 아파트
  | 'villa_house'     // 빌라/주택
  | 'office'          // 사무실
  | 'unknown';        // 모름

/** 이사 형태 (서비스 기준) */
export type MoveType =
  | 'truck'      // 용달이사 (운반만)
  | 'general'    // 일반이사 (운반 + 배치)
  | 'half_pack'  // 반포장이사 (부분 포장)
  | 'full_pack'  // 포장이사 (전체 서비스)
  | 'storage'    // 보관이사
  | 'unknown';   // 모름

/** 날짜 확정 여부 */
export type DateType = 'exact' | 'range' | 'unknown';

/** 희망 시간대 */
export type TimeSlot =
  | 'early_morning'    // 06:00~09:00
  | 'morning'          // 09:00~12:00
  | 'early_afternoon'  // 12:00~15:00
  | 'late_afternoon'   // 15:00~18:00
  | 'flexible'         // 시간 협의
  | 'unknown';         // 모름

/** 예/아니오/모름 */
export type YesNoUnknown = 'yes' | 'no' | 'unknown';

/** 층수 입력 상태 */
export type FloorStatus = 'known' | 'unknown';

/** 평수 범위 */
export type SquareFootage =
  | 'under_10'  // 10평 이하
  | '10_15'     // 10~15평
  | '15_25'     // 15~25평
  | '25_35'     // 25~35평
  | '35_45'     // 35~45평
  | 'over_45'   // 45평 이상
  | 'unknown';  // 모름

/** 박스 수 범위 */
export type BoxRange =
  | '1_5'      // 1~5개
  | '6_10'     // 6~10개
  | '11_15'    // 11~15개
  | '16_20'    // 16~20개
  | 'over_20'  // 20개 초과
  | 'none'     // 잔짐 없음
  | 'unknown'; // 모름

/** 사다리차 필요 여부 */
export type LadderTruck = 'required' | 'not_required' | 'unknown';

/** 연락 가능 시간대 */
export type ContactTime = 'anytime' | 'morning' | 'afternoon' | 'evening';

/** 통신사 */
export type Carrier = 'SKT' | 'KT' | 'LGU+' | '알뜰폰';

/** 입력 경로 */
export type InputSource = 'guided' | 'chat' | 'form' | 'mixed';

/** 접속 환경 */
export type Platform = 'mobile' | 'desktop';

/** 값의 출처 */
export type ConfidenceSource = 'guided' | 'chat' | 'form' | 'system';

/** 트럭 대수 선호 */
export type VehiclePreference = '1' | '2' | 'unknown';

/** 운반 방식 */
export type TransportMethod = 'elevator' | 'stairs' | 'ladder' | 'unknown';

// ============================================
// 보조 인터페이스
// ============================================

/** 가전/가구 아이템 */
export interface CargoItem {
  has: boolean;
  qty: number;
  note: string;
}

/** 특수 짐 아이템 */
export interface SpecialItem {
  has: boolean;
  note: string;
}

/** 사용자 정의 특수 짐 */
export interface CustomSpecialItem {
  name: string;
  note: string;
}

/** 필드 확신도 */
export interface FieldConfidence {
  value: unknown;
  confidence: number; // 0~1
  source: ConfidenceSource;
}

/** 누락 필드 정보 */
export interface MissingField {
  field: string;
  priority: number; // 1=최우선, 4=최후
  questionTemplate: string;
}

// ============================================
// 9개 섹션 인터페이스
// ============================================

/** 1. 메타 정보 */
export interface MetaInfo {
  requestId: string;
  source: InputSource;
  platform: Platform;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  version: string;
}

/** 2. 이사 기본 정보 */
export interface MoveInfo {
  category: MoveCategory;
  type: MoveType;
  schedule: {
    dateType: DateType;
    date: string | null;     // YYYY-MM-DD (exact일 때)
    dateFrom: string | null; // YYYY-MM-DD (range일 때)
    dateTo: string | null;   // YYYY-MM-DD (range일 때)
  };
  timeSlot: TimeSlot;
}

/** 3. 위치 정보 (출발지/도착지 공통) */
export interface LocationInfo {
  address: string | null;
  detailAddress: string | null;
  floor: number | null; // -1=지하, 0=반지하, 1~99=해당 층
  floorStatus: FloorStatus;
  hasElevator: YesNoUnknown;
  transportMethod: TransportMethod; // 운반 방식 (엘리베이터/계단/사다리차)
  parking: YesNoUnknown;
  squareFootage: SquareFootage | null;
}

/** 4. 짐 정보 */
export interface CargoInfo {
  appliances: {
    refrigerator: CargoItem;
    washer: CargoItem;
    tv: CargoItem;
    airConditioner: CargoItem;
    dryer: CargoItem;
    dishwasher: CargoItem;
  };
  furniture: {
    bed: CargoItem;
    wardrobe: CargoItem;
    sofa: CargoItem;
    desk: CargoItem;
    bookshelf: CargoItem;
    diningTable: CargoItem;
  };
  special: {
    piano: SpecialItem;
    stoneBed: SpecialItem;
    safe: SpecialItem;
    aquarium: SpecialItem;
    custom: CustomSpecialItem[];
  };
  boxes: {
    range: BoxRange;
    exactCount: number | null;
  };
}

/** 5. 부가 서비스 */
export interface Services {
  ladderTruck: LadderTruck;
  airconInstall: {
    needed: boolean;
    qty: number;
  };
  cleaning: boolean;
  organizing: boolean;
  storage: {
    needed: boolean;
    durationDays: number;
  };
  disposal: boolean;
}

/** 6. 기타 조건 */
export interface Conditions {
  extraRequests: string | null; // 짐 상세 + 요청사항 (필수)
  vehiclePreference: VehiclePreference | null; // 트럭 대수
  customerParticipation: boolean | null; // 고객 함께 작업 여부
}

/** 7. 연락처 정보 */
export interface ContactInfo {
  name: string | null;
  phone: string | null;
  carrier: Carrier | null;
  preferredTime: ContactTime | null;
}

/** 8. 상태 관리 */
export interface StatusInfo {
  completionRate: number; // 0.0~1.0
  missingRequired: MissingField[];
  fieldConfidence: Record<string, FieldConfidence>;
  readyForSubmit: boolean;
  submittedAt: string | null; // ISO-8601
}

// ============================================
// 최상위 스키마
// ============================================

/** 이사 견적 스키마 (Single Source of Truth) */
export interface MovingSchema {
  meta: MetaInfo;
  move: MoveInfo;
  departure: LocationInfo;
  arrival: LocationInfo;
  cargo: CargoInfo;
  services: Services;
  conditions: Conditions;
  contact: ContactInfo;
  status: StatusInfo;
}

// ============================================
// 기본값 생성 함수
// ============================================

/** 빈 CargoItem 생성 */
function createEmptyCargoItem(): CargoItem {
  return { has: false, qty: 0, note: '' };
}

/** 빈 SpecialItem 생성 */
function createEmptySpecialItem(): SpecialItem {
  return { has: false, note: '' };
}

/** 빈 LocationInfo 생성 */
function createEmptyLocation(): LocationInfo {
  return {
    address: null,
    detailAddress: null,
    floor: null,
    floorStatus: 'unknown',
    hasElevator: 'unknown',
    transportMethod: 'unknown',
    parking: 'unknown',
    squareFootage: null,
  };
}

/** 기본 스키마 생성 */
export function createDefaultSchema(): MovingSchema {
  const now = new Date().toISOString();

  return {
    meta: {
      requestId: crypto.randomUUID(),
      source: 'guided',
      platform: 'mobile',
      createdAt: now,
      updatedAt: now,
      version: '2.1',
    },
    move: {
      category: 'unknown',
      type: 'unknown',
      schedule: {
        dateType: 'unknown',
        date: null,
        dateFrom: null,
        dateTo: null,
      },
      timeSlot: 'unknown',
    },
    departure: createEmptyLocation(),
    arrival: createEmptyLocation(),
    cargo: {
      appliances: {
        refrigerator: createEmptyCargoItem(),
        washer: createEmptyCargoItem(),
        tv: createEmptyCargoItem(),
        airConditioner: createEmptyCargoItem(),
        dryer: createEmptyCargoItem(),
        dishwasher: createEmptyCargoItem(),
      },
      furniture: {
        bed: createEmptyCargoItem(),
        wardrobe: createEmptyCargoItem(),
        sofa: createEmptyCargoItem(),
        desk: createEmptyCargoItem(),
        bookshelf: createEmptyCargoItem(),
        diningTable: createEmptyCargoItem(),
      },
      special: {
        piano: createEmptySpecialItem(),
        stoneBed: createEmptySpecialItem(),
        safe: createEmptySpecialItem(),
        aquarium: createEmptySpecialItem(),
        custom: [],
      },
      boxes: {
        range: 'unknown',
        exactCount: null,
      },
    },
    services: {
      ladderTruck: 'unknown',
      airconInstall: { needed: false, qty: 0 },
      cleaning: false,
      organizing: false,
      storage: { needed: false, durationDays: 0 },
      disposal: false,
    },
    conditions: {
      extraRequests: null,
      vehiclePreference: null,
      customerParticipation: null,
    },
    contact: {
      name: null,
      phone: null,
      carrier: null,
      preferredTime: null,
    },
    status: {
      completionRate: 0,
      missingRequired: [],
      fieldConfidence: {},
      readyForSubmit: false,
      submittedAt: null,
    },
  };
}

// ============================================
// 필수 필드 목록 (13개)
// ============================================

export const REQUIRED_FIELDS = [
  'move.category',
  'move.type',
  'move.schedule',
  'move.timeSlot',
  'departure.address',
  'departure.floor',
  'departure.hasElevator',
  'departure.squareFootage',
  'arrival.address',
  'arrival.floor',
  'arrival.hasElevator',
  'contact.name',
  'contact.phone',
] as const;

export type RequiredField = typeof REQUIRED_FIELDS[number];

// ============================================
// 유틸리티 타입
// ============================================

/** 스키마 부분 업데이트용 타입 */
export type PartialMovingSchema = {
  [K in keyof MovingSchema]?: Partial<MovingSchema[K]>;
};

/** dot notation 경로 타입 (예: 'move.category', 'departure.floor') */
export type SchemaPath = string;

// ============================================
// 한국어 라벨 매핑
// ============================================

export const MOVE_CATEGORY_LABELS: Record<MoveCategory, string> = {
  one_room: '원룸',
  two_room: '투룸',
  three_room_plus: '쓰리룸 이상',
  officetel: '오피스텔',
  apartment: '아파트',
  villa_house: '빌라/주택',
  office: '사무실',
  unknown: '모름',
};

export const MOVE_TYPE_LABELS: Record<MoveType, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
  unknown: '모름',
};

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  early_morning: '오전 (이른) 06:00~09:00',
  morning: '오전 09:00~12:00',
  early_afternoon: '오후 (이른) 12:00~15:00',
  late_afternoon: '오후 (늦은) 15:00~18:00',
  flexible: '시간 협의',
  unknown: '모름',
};

export const SQUARE_FOOTAGE_LABELS: Record<SquareFootage, string> = {
  under_10: '10평 이하',
  '10_15': '10~15평',
  '15_25': '15~25평',
  '25_35': '25~35평',
  '35_45': '35~45평',
  over_45: '45평 이상',
  unknown: '모름',
};

export const BOX_RANGE_LABELS: Record<BoxRange, string> = {
  '1_5': '1~5개',
  '6_10': '6~10개',
  '11_15': '11~15개',
  '16_20': '16~20개',
  over_20: '20개 초과',
  none: '잔짐 없음',
  unknown: '모름',
};

export const CARRIER_LABELS: Record<Carrier, string> = {
  SKT: 'SKT',
  KT: 'KT',
  'LGU+': 'LG U+',
  '알뜰폰': '알뜰폰',
};

export const CONTACT_TIME_LABELS: Record<ContactTime, string> = {
  anytime: '언제든',
  morning: '오전',
  afternoon: '오후',
  evening: '저녁',
};
