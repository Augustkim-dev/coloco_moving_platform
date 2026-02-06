/**
 * 가이드 대화 시스템 - Step 진행 엔진
 *
 * Step 진행, 스킵 로직, 진행률 계산, 제출 가능 여부 확인
 */

import type {
  MovingSchema,
  MissingField,
  PartialMovingSchema,
} from '@/types/schema';
import { createDefaultSchema, REQUIRED_FIELDS } from '@/types/schema';
import {
  GUIDED_STEPS,
  GuidedStep,
  getActiveSteps,
  getStepById,
} from './steps';

// ============================================
// 엔진 상태 타입
// ============================================

export interface GuidedFlowState {
  currentStepIndex: number;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  answers: Map<string, unknown>;
}

// ============================================
// 유틸리티: dot notation 경로로 값 가져오기/설정하기
// ============================================

/** dot notation 경로로 객체에서 값 가져오기 */
export function getValueByPath(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/** dot notation 경로로 객체에 값 설정하기 (불변 업데이트) */
export function setValueByPath<T extends object>(
  obj: T,
  path: string,
  value: unknown
): T {
  const keys = path.split('.');
  const result = structuredClone(obj);
  let current: Record<string, unknown> = result as Record<string, unknown>;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || current[key] === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/** 두 스키마 깊은 병합 */
export function mergeSchema(
  base: MovingSchema,
  updates: PartialMovingSchema
): MovingSchema {
  const result = structuredClone(base);

  for (const [section, sectionUpdates] of Object.entries(updates)) {
    if (sectionUpdates && typeof sectionUpdates === 'object') {
      const resultAny = result as unknown as Record<string, unknown>;
      resultAny[section] = {
        ...(resultAny[section] as object),
        ...sectionUpdates,
      };
    }
  }

  return result;
}

// ============================================
// 가이드 플로우 엔진 클래스
// ============================================

export class GuidedFlowEngine {
  private schema: MovingSchema;
  private state: GuidedFlowState;

  constructor(initialSchema?: MovingSchema) {
    this.schema = initialSchema ?? createDefaultSchema();
    this.state = {
      currentStepIndex: 0,
      completedSteps: new Set(),
      skippedSteps: new Set(),
      answers: new Map(),
    };
  }

  // ============================================
  // Getter 메서드
  // ============================================

  /** 현재 스키마 반환 */
  getSchema(): MovingSchema {
    return this.schema;
  }

  /** 현재 상태 반환 */
  getState(): GuidedFlowState {
    return this.state;
  }

  /** 활성 Step 목록 (스킵 제외) */
  getActiveSteps(): GuidedStep[] {
    return getActiveSteps(this.schema);
  }

  /** 현재 Step 반환 */
  getCurrentStep(): GuidedStep | null {
    const activeSteps = this.getActiveSteps();

    // 완료되지 않은 첫 번째 Step 찾기
    for (const step of activeSteps) {
      if (!this.state.completedSteps.has(step.id)) {
        return step;
      }
    }

    return null; // 모든 Step 완료
  }

  /** 다음 Step 반환 (현재 Step 완료 후) */
  getNextStep(): GuidedStep | null {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return null;

    const activeSteps = this.getActiveSteps();
    const currentIndex = activeSteps.findIndex((s) => s.id === currentStep.id);

    if (currentIndex === -1 || currentIndex >= activeSteps.length - 1) {
      return null;
    }

    return activeSteps[currentIndex + 1];
  }

  /** 이전 Step 반환 */
  getPreviousStep(): GuidedStep | null {
    const activeSteps = this.getActiveSteps();
    const completedArray = Array.from(this.state.completedSteps);

    if (completedArray.length === 0) return null;

    const lastCompletedId = completedArray[completedArray.length - 1];
    return getStepById(lastCompletedId) ?? null;
  }

  // ============================================
  // 답변 처리
  // ============================================

  /** 답변 처리 및 스키마 업데이트 */
  processAnswer(stepId: string, value: unknown): MovingSchema {
    const step = getStepById(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    // 1. 답변 저장
    this.state.answers.set(stepId, value);

    // 2. transform 함수가 있으면 사용, 없으면 기본 처리
    if (step.transform) {
      const updates = step.transform(value, this.schema);
      this.schema = mergeSchema(this.schema, updates);
    } else {
      // 기본: schemaPath에 직접 값 설정
      this.schema = setValueByPath(this.schema, step.schemaPath, value);
    }

    // 3. Step 완료 처리
    this.state.completedSteps.add(stepId);

    // 4. 스킵 조건 재평가 (이사 형태 변경 시 Step 11,12,14 스킵 여부 변경)
    this.reevaluateSkipConditions();

    // 5. 상태 정보 업데이트
    this.updateStatus();

    // 6. updatedAt 갱신
    this.schema.meta.updatedAt = new Date().toISOString();

    return this.schema;
  }

  /** 이전 답변 수정 (해당 Step으로 되돌아가기) */
  revertToStep(stepId: string): void {
    const step = getStepById(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const activeSteps = this.getActiveSteps();
    const targetIndex = activeSteps.findIndex((s) => s.id === stepId);

    if (targetIndex === -1) {
      throw new Error(`Step is currently skipped: ${stepId}`);
    }

    // 해당 Step 이후의 모든 완료 상태 제거
    for (let i = targetIndex; i < activeSteps.length; i++) {
      const stepToReset = activeSteps[i];
      this.state.completedSteps.delete(stepToReset.id);
      this.state.answers.delete(stepToReset.id);
    }

    this.state.currentStepIndex = targetIndex;
  }

  /** AI 파싱 결과 적용 */
  applyAIParsedData(
    parsedData: PartialMovingSchema,
    confidenceMap: Record<string, number>
  ): void {
    // 1. 스키마 병합
    this.schema = mergeSchema(this.schema, parsedData);

    // 2. fieldConfidence 업데이트
    for (const [path, confidence] of Object.entries(confidenceMap)) {
      const value = getValueByPath(this.schema, path);
      this.schema.status.fieldConfidence[path] = {
        value,
        confidence,
        source: 'chat',
      };

      // confidence가 높으면 해당 Step 완료 처리
      if (confidence >= 0.8) {
        const step = this.findStepBySchemaPath(path);
        if (step) {
          this.state.completedSteps.add(step.id);
          this.state.answers.set(step.id, value);
        }
      }
    }

    // 3. 스킵 조건 재평가
    this.reevaluateSkipConditions();

    // 4. 상태 업데이트
    this.updateStatus();
  }

  // ============================================
  // 진행률 및 제출 가능 여부
  // ============================================

  /** 진행률 계산 (0~1) */
  getCompletionRate(): number {
    const missingCount = this.getMissingRequiredFields().length;
    const totalRequired = REQUIRED_FIELDS.length;
    const completedCount = totalRequired - missingCount;

    return totalRequired > 0 ? completedCount / totalRequired : 0;
  }

  /** 누락된 필수 필드 목록 */
  getMissingRequiredFields(): MissingField[] {
    const missing: MissingField[] = [];

    for (const fieldPath of REQUIRED_FIELDS) {
      const value = getValueByPath(this.schema, fieldPath);

      // 값이 없거나 'unknown'인 경우 누락으로 처리
      if (this.isFieldEmpty(fieldPath, value)) {
        missing.push({
          field: fieldPath,
          priority: this.getFieldPriority(fieldPath),
          questionTemplate: this.getQuestionTemplate(fieldPath),
        });
      }
    }

    // 우선순위로 정렬
    return missing.sort((a, b) => a.priority - b.priority);
  }

  /** 제출 가능 여부 */
  canSubmit(): boolean {
    const missing = this.getMissingRequiredFields();

    // 모든 필수 필드가 채워졌는지 확인
    if (missing.length > 0) return false;

    // 연락처 검증
    if (!this.schema.contact.name || !this.schema.contact.phone) {
      return false;
    }

    // 이사 날짜 검증
    if (this.schema.move.schedule.dateType === 'unknown') {
      return false;
    }

    return true;
  }

  // ============================================
  // 내부 헬퍼 메서드
  // ============================================

  /** 스킵 조건 재평가 */
  private reevaluateSkipConditions(): void {
    this.state.skippedSteps.clear();

    for (const step of GUIDED_STEPS) {
      if (step.skipCondition && step.skipCondition(this.schema)) {
        this.state.skippedSteps.add(step.id);
        // 스킵된 Step의 완료 상태 제거
        this.state.completedSteps.delete(step.id);
      }
    }
  }

  /** 상태 정보 업데이트 */
  private updateStatus(): void {
    this.schema.status.completionRate = this.getCompletionRate();
    this.schema.status.missingRequired = this.getMissingRequiredFields();
    this.schema.status.readyForSubmit = this.canSubmit();
  }

  /** 필드가 비어있는지 확인 */
  private isFieldEmpty(fieldPath: string, value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (value === 'unknown') return true;
    if (typeof value === 'string' && value.trim() === '') return true;

    // schedule 특수 처리
    if (fieldPath === 'move.schedule') {
      const schedule = value as MovingSchema['move']['schedule'];
      if (schedule.dateType === 'unknown') return true;
      if (schedule.dateType === 'exact' && !schedule.date) return true;
      if (schedule.dateType === 'range' && (!schedule.dateFrom || !schedule.dateTo)) return true;
      return false;
    }

    // floor 특수 처리 (floorStatus가 unknown이면 허용)
    if (fieldPath === 'departure.floor' || fieldPath === 'arrival.floor') {
      const location = fieldPath.startsWith('departure')
        ? this.schema.departure
        : this.schema.arrival;

      if (location.floorStatus === 'unknown') return false;
      return value === null;
    }

    return false;
  }

  /** 필드 우선순위 반환 */
  private getFieldPriority(fieldPath: string): number {
    // 1: 위치 관련 (비용 산정 직접 영향)
    if (fieldPath.includes('floor') || fieldPath.includes('Elevator')) {
      return 1;
    }
    // 2: 일정
    if (fieldPath.includes('schedule')) {
      return 2;
    }
    // 3: 이사 분류
    if (fieldPath.includes('category') || fieldPath.includes('type')) {
      return 3;
    }
    // 4: 연락처 (마지막)
    if (fieldPath.includes('contact')) {
      return 4;
    }
    return 3;
  }

  /** 질문 템플릿 반환 */
  private getQuestionTemplate(fieldPath: string): string {
    const templates: Record<string, string> = {
      'move.category': '어떤 공간에서 이사하시나요?',
      'move.type': '어떤 이사 서비스를 원하시나요?',
      'move.schedule': '이사 예정일이 언제인가요?',
      'move.timeSlot': '희망 시간대를 알려주세요',
      'departure.address': '출발지 주소를 알려주세요',
      'departure.floor': '출발지 층수를 알려주세요',
      'departure.hasElevator': '출발지에 엘리베이터가 있나요?',
      'departure.squareFootage': '출발지 평수를 알려주세요',
      'arrival.address': '도착지 주소를 알려주세요',
      'arrival.floor': '도착지 층수를 알려주세요',
      'arrival.hasElevator': '도착지에 엘리베이터가 있나요?',
      'contact.name': '이름을 알려주세요',
      'contact.phone': '연락처를 알려주세요',
    };

    return templates[fieldPath] ?? `${fieldPath}을(를) 입력해주세요`;
  }

  /** schemaPath로 Step 찾기 */
  private findStepBySchemaPath(schemaPath: string): GuidedStep | undefined {
    return GUIDED_STEPS.find((step) => {
      // 정확히 일치하거나 상위 경로 포함
      return step.schemaPath === schemaPath ||
             schemaPath.startsWith(step.schemaPath + '.');
    });
  }

  // ============================================
  // 스키마 직접 업데이트
  // ============================================

  /** 스키마 필드 직접 업데이트 */
  setFieldValue(path: string, value: unknown): MovingSchema {
    this.schema = setValueByPath(this.schema, path, value);
    this.updateStatus();
    this.schema.meta.updatedAt = new Date().toISOString();
    return this.schema;
  }

  /** 스키마 병합 */
  mergeSchemaUpdates(updates: PartialMovingSchema): MovingSchema {
    this.schema = mergeSchema(this.schema, updates);
    this.reevaluateSkipConditions();
    this.updateStatus();
    this.schema.meta.updatedAt = new Date().toISOString();
    return this.schema;
  }

  /** 스키마 초기화 */
  reset(): void {
    this.schema = createDefaultSchema();
    this.state = {
      currentStepIndex: 0,
      completedSteps: new Set(),
      skippedSteps: new Set(),
      answers: new Map(),
    };
  }
}

// ============================================
// 팩토리 함수
// ============================================

/** 새 엔진 인스턴스 생성 */
export function createGuidedFlowEngine(
  initialSchema?: MovingSchema
): GuidedFlowEngine {
  return new GuidedFlowEngine(initialSchema);
}
