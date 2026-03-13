/**
 * 채팅 상태 관리 (Zustand)
 *
 * 채팅 메시지, 가이드 대화 상태, AI 호출 관리
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GuidedStep, StepOption } from '@/lib/guided-flow/steps';
import { getStepById, GUIDED_STEPS, createRecoveryStep } from '@/lib/guided-flow/steps';
import { useEstimateStore } from './estimateStore';

// ============================================
// 메시지 타입
// ============================================

export type MessageRole = 'user' | 'system' | 'ai';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;

  // 가이드 대화 관련
  stepId?: string;
  inputComponent?: string;
  options?: StepOption[];

  // 수정 관련
  editable?: boolean;
  editedAt?: Date;

  // AI 관련
  confidence?: number;
  isLoading?: boolean;
}

export type InputMode = 'guided' | 'free_text';

// ============================================
// 스토어 상태 타입
// ============================================

export interface ChatState {
  // 메시지
  messages: ChatMessage[];

  // 입력 모드
  inputMode: InputMode;

  // 로딩 상태
  isLoading: boolean;

  // 현재 Step
  currentStepId: string | null;

  // 완료된 Step
  completedStepIds: Set<string>;

  // 복구 모드 상태
  isInRecoveryMode: boolean;
  currentRecoveryStep: GuidedStep | null;
  attemptedRecoveryFields: Set<string>;

  // 액션
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;

  // 가이드 대화
  initializeChat: () => void;
  handleGuidedAnswer: (stepId: string, value: unknown, displayText: string) => void;
  showNextStep: () => void;
  revertToStep: (stepId: string) => void;

  // 자유 입력
  setInputMode: (mode: InputMode) => void;
  handleFreeTextInput: (text: string) => Promise<void>;

  // 유틸
  setLoading: (isLoading: boolean) => void;
  clearChat: () => void;
  getCurrentStep: () => GuidedStep | null;
  getNextStep: () => GuidedStep | null;
}

// ============================================
// 유틸리티
// ============================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function findNextActiveStep(
  currentStepId: string | null,
  completedStepIds: Set<string>
): GuidedStep | null {
  const estimateStore = useEstimateStore.getState();
  const schema = estimateStore.schema;

  // 활성 Step 목록 (스킵 제외)
  const activeSteps = GUIDED_STEPS.filter(
    (step) => !step.skipCondition || !step.skipCondition(schema)
  );

  if (!currentStepId) {
    // 첫 미완료 Step 반환
    const firstUncompleted = activeSteps.find((s) => !completedStepIds.has(s.id));
    return firstUncompleted ?? null;
  }

  const currentIndex = activeSteps.findIndex((s) => s.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= activeSteps.length - 1) {
    return null;
  }

  // 다음 완료되지 않은 Step 찾기
  for (let i = currentIndex + 1; i < activeSteps.length; i++) {
    if (!completedStepIds.has(activeSteps[i].id)) {
      return activeSteps[i];
    }
  }

  return null;
}

// ============================================
// 질문 힌트 생성
// ============================================

/** 질문에 선택지 힌트를 추가 (자유입력 시 답변 유도) */
function buildQuestionWithHint(step: GuidedStep): string {
  let text = step.question;

  if (step.options?.length) {
    const labels = step.options.map((o) => o.label).join(', ');
    text += `\n💡 ${labels} 중에서 알려주세요`;
  } else if (step.description) {
    text += `\n💡 ${step.description}`;
  }

  return text;
}

// ============================================
// 스토어 생성
// ============================================

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      messages: [],
      inputMode: 'guided',
      isLoading: false,
      currentStepId: null,
      completedStepIds: new Set(),
      isInRecoveryMode: false,
      currentRecoveryStep: null,
      attemptedRecoveryFields: new Set(),

      // 메시지 추가
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateMessageId(),
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      // 메시지 업데이트
      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, ...updates, editedAt: new Date() }
              : msg
          ),
        }));
      },

      // 메시지 삭제
      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        }));
      },

      // 채팅 초기화 (첫 Step 시작)
      initializeChat: () => {
        const { messages } = get();

        // 이미 메시지가 있으면 스킵
        if (messages.length > 0) return;

        // 랜딩 위저드에서 사전 입력된 데이터 확인
        const estimateStore = useEstimateStore.getState();
        const schema = estimateStore.schema;
        const isFromLanding = schema.conditions.vehicleType !== null;

        // 사전 입력된 스텝을 completedStepIds에 추가
        const prefilledStepIds = new Set<string>();
        if (schema.move.schedule.date) prefilledStepIds.add('move_date');
        if (schema.move.category !== 'unknown') prefilledStepIds.add('move_category');
        if (schema.departure.squareFootage && schema.departure.squareFootage !== 'unknown') prefilledStepIds.add('square_footage');
        if (schema.move.type !== 'unknown') prefilledStepIds.add('move_type');

        if (prefilledStepIds.size > 0) {
          set({ completedStepIds: prefilledStepIds });
        }

        // 환영 메시지
        get().addMessage({
          role: 'system',
          content: isFromLanding
            ? '차량 선택이 완료되었어요! 나머지 정보를 입력해주세요.'
            : '안녕하세요! 이사 견적을 도와드릴게요. 몇 가지 질문에 답해주시면 최적의 업체를 찾아드릴게요.',
        });

        // 첫 Step 표시 (사전 입력된 스텝은 자동 스킵됨)
        setTimeout(() => {
          get().showNextStep();
        }, 500);
      },

      // 가이드 답변 처리
      handleGuidedAnswer: (stepId, value, displayText) => {
        const { isInRecoveryMode, currentRecoveryStep } = get();
        const estimateStore = useEstimateStore.getState();

        // 1. 사용자 답변 메시지 추가
        get().addMessage({
          role: 'user',
          content: displayText,
          stepId,
          editable: true,
        });

        // 2. 복구 스텝 vs 일반 스텝 처리
        if (isInRecoveryMode && currentRecoveryStep && stepId === currentRecoveryStep.id) {
          // 복구 스텝: transform이 있으면 사용, 없으면 setFieldValue 직접 호출
          if (currentRecoveryStep.transform) {
            const updates = currentRecoveryStep.transform(value, estimateStore.schema);
            estimateStore.engine.mergeSchemaUpdates(updates);
            estimateStore.setSchema(estimateStore.engine.getSchema());
          } else {
            estimateStore.setFieldValue(currentRecoveryStep.schemaPath, value, 'guided');
          }

          // 복구 스텝 완료 처리
          set((state) => ({
            completedStepIds: new Set([...state.completedStepIds, stepId]),
            currentStepId: stepId,
            currentRecoveryStep: null,
          }));
        } else {
          // 일반 스텝: engine.processAnswer 사용
          const step = getStepById(stepId);
          if (!step) return;

          const updatedSchema = estimateStore.engine.processAnswer(stepId, value);
          estimateStore.setSchema(updatedSchema);

          // Step 완료 처리
          set((state) => ({
            completedStepIds: new Set([...state.completedStepIds, stepId]),
            currentStepId: stepId,
          }));
        }

        // 3. 다음 Step 표시
        setTimeout(() => {
          get().showNextStep();
        }, 300);
      },

      // 다음 Step 표시
      showNextStep: () => {
        const { currentStepId, completedStepIds, attemptedRecoveryFields } = get();
        const nextStep = findNextActiveStep(currentStepId, completedStepIds);

        if (nextStep) {
          // 일반 플로우 진행
          // TipCard가 있으면 먼저 표시
          if (nextStep.tipCard) {
            get().addMessage({
              role: 'system',
              content: `💡 ${nextStep.tipCard.title}\n${nextStep.tipCard.description}`,
            });
          }

          // Step 질문 메시지 추가 (선택지 힌트 포함)
          get().addMessage({
            role: 'system',
            content: buildQuestionWithHint(nextStep),
            stepId: nextStep.id,
            inputComponent: nextStep.inputType,
            options: nextStep.options,
          });

          set({ currentStepId: nextStep.id, isInRecoveryMode: false });
          return;
        }

        // 모든 일반 Step 완료 - 복구 모드 확인
        const estimateStore = useEstimateStore.getState();
        const missingFields = estimateStore.engine.getMissingRequiredFields();

        // 시도하지 않은 누락 필드 필터링
        const unAttempted = missingFields.filter(
          (f) => !attemptedRecoveryFields.has(f.field)
        );

        if (unAttempted.length > 0) {
          const nextMissing = unAttempted[0]; // 우선순위순 정렬됨
          const recoveryStep = createRecoveryStep(nextMissing.field);

          if (recoveryStep) {
            // 첫 복구 모드 진입 시 안내 메시지
            if (!get().isInRecoveryMode) {
              get().addMessage({
                role: 'system',
                content: '입력이 누락된 항목이 있어요. 추가 확인이 필요합니다.',
              });
            }

            // 복구 질문 표시
            get().addMessage({
              role: 'system',
              content: recoveryStep.question,
              stepId: recoveryStep.id,
              inputComponent: recoveryStep.inputType,
              options: recoveryStep.options,
            });

            set({
              currentStepId: recoveryStep.id,
              isInRecoveryMode: true,
              currentRecoveryStep: recoveryStep,
              attemptedRecoveryFields: new Set([...attemptedRecoveryFields, nextMissing.field]),
            });
            return;
          }
        }

        // 모든 필수항목 완료 → 제출 가능
        set({ isInRecoveryMode: false, currentRecoveryStep: null });

        if (estimateStore.canSubmit()) {
          get().addMessage({
            role: 'system',
            content: '모든 정보 입력이 완료되었어요! 아래 버튼을 눌러 견적을 요청해주세요.',
          });
        }
      },

      // 이전 Step으로 되돌아가기
      revertToStep: (stepId) => {
        const step = getStepById(stepId);
        if (!step) return;

        const { completedStepIds, messages } = get();
        const estimateStore = useEstimateStore.getState();

        // 1. 해당 Step 이후의 완료 상태 제거
        const newCompletedStepIds = new Set<string>();
        let foundStep = false;

        for (const id of completedStepIds) {
          if (id === stepId) {
            foundStep = true;
            continue;
          }
          if (!foundStep) {
            newCompletedStepIds.add(id);
          }
        }

        // 2. 해당 Step 이후의 메시지 제거
        const stepIndex = messages.findIndex(
          (msg) => msg.stepId === stepId && msg.role === 'user'
        );
        const newMessages = stepIndex >= 0 ? messages.slice(0, stepIndex) : messages;

        // 3. 엔진에서도 되돌리기
        estimateStore.engine.revertToStep(stepId);
        estimateStore.setSchema(estimateStore.engine.getSchema());

        set({
          messages: newMessages,
          completedStepIds: newCompletedStepIds,
          currentStepId: stepId,
          // 복구 모드 초기화
          isInRecoveryMode: false,
          currentRecoveryStep: null,
          attemptedRecoveryFields: new Set(),
        });

        // 4. 해당 Step 다시 표시
        setTimeout(() => {
          get().showNextStep();
        }, 100);
      },

      // 입력 모드 변경
      setInputMode: (mode) => {
        set({ inputMode: mode });
      },

      // 자유 입력 처리
      handleFreeTextInput: async (text) => {
        set({ isLoading: true });

        // 0. 현재 Step의 옵션과 로컬 매칭 시도 (AI 호출 불필요)
        const { currentStepId } = get();
        if (currentStepId) {
          const currentStep = getStepById(currentStepId);
          if (currentStep?.options?.length) {
            const normalized = text.trim().toLowerCase();
            const matched = currentStep.options.find(
              (o) => o.label.toLowerCase() === normalized
                || o.value.toLowerCase() === normalized
                || o.label.toLowerCase().includes(normalized)
            );
            if (matched) {
              set({ isLoading: false });
              get().handleGuidedAnswer(currentStep.id, matched.value, matched.label);
              return;
            }
          }
        }

        // 1. 사용자 메시지 추가
        get().addMessage({
          role: 'user',
          content: text,
        });

        try {
          // 2. AI 파싱 API 호출
          const estimateStore = useEstimateStore.getState();

          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              mode: 'parse',
            }),
          });

          if (!response.ok) {
            throw new Error('AI 파싱 중 오류가 발생했습니다');
          }

          const result = await response.json();

          // result 구조: { success, data, confidence, message }
          // data = PartialMovingSchema, confidence = Record<string, number>
          if (result.success && result.data) {
            // 3. AI 파싱 결과 적용
            const parsedData = result.data;
            const fieldConfidence = result.confidence || {};
            estimateStore.applyAIUpdate(parsedData, fieldConfidence);

            // 4. 신뢰도 평균 계산
            const confidenceValues = Object.values(fieldConfidence) as number[];
            const avgConfidence = confidenceValues.length > 0
              ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
              : 0;

            // 5. AI 응답 메시지
            get().addMessage({
              role: 'ai',
              content: result.message || '정보를 입력받았어요!',
              confidence: avgConfidence,
            });

            // 6. 파싱된 필드에 해당하는 Step 완료 처리
            const completedSteps = new Set(get().completedStepIds);
            for (const path of Object.keys(fieldConfidence)) {
              const step = GUIDED_STEPS.find(
                (s) => s.schemaPath === path || path.startsWith(s.schemaPath + '.')
              );
              if (step && fieldConfidence[path] >= 0.8) {
                completedSteps.add(step.id);
              }
            }
            set({ completedStepIds: completedSteps });
          } else {
            // 파싱 실패 시
            get().addMessage({
              role: 'system',
              content: result.error || '입력을 이해하지 못했어요. 다시 말씀해주세요.',
            });
          }

          // 7. 다음 Step 표시
          setTimeout(() => {
            get().showNextStep();
          }, 500);
        } catch (error) {
          console.error('Free text input error:', error);
          get().addMessage({
            role: 'system',
            content: '죄송해요, 입력을 처리하는 중 오류가 발생했어요. 다시 시도해주세요.',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // 로딩 상태 설정
      setLoading: (isLoading) => set({ isLoading }),

      // 채팅 초기화
      clearChat: () => {
        set({
          messages: [],
          inputMode: 'guided',
          isLoading: false,
          currentStepId: null,
          completedStepIds: new Set(),
          // 복구 모드 초기화
          isInRecoveryMode: false,
          currentRecoveryStep: null,
          attemptedRecoveryFields: new Set(),
        });
      },

      // 현재 Step 반환
      getCurrentStep: () => {
        const { currentStepId } = get();
        return currentStepId ? getStepById(currentStepId) ?? null : null;
      },

      // 다음 Step 반환
      getNextStep: () => {
        const { currentStepId, completedStepIds } = get();
        return findNextActiveStep(currentStepId, completedStepIds);
      },
    }),
    { name: 'ChatStore' }
  )
);

// ============================================
// 셀렉터
// ============================================

/** 메시지 셀렉터 */
export const selectMessages = (state: ChatState) => state.messages;

/** 입력 모드 셀렉터 */
export const selectInputMode = (state: ChatState) => state.inputMode;

/** 로딩 상태 셀렉터 */
export const selectIsLoading = (state: ChatState) => state.isLoading;

/** 현재 Step ID 셀렉터 */
export const selectCurrentStepId = (state: ChatState) => state.currentStepId;

/** 완료된 Step 셀렉터 */
export const selectCompletedStepIds = (state: ChatState) => state.completedStepIds;

/** 복구 모드 셀렉터 */
export const selectIsInRecoveryMode = (state: ChatState) => state.isInRecoveryMode;

/** 현재 복구 스텝 셀렉터 */
export const selectCurrentRecoveryStep = (state: ChatState) => state.currentRecoveryStep;
