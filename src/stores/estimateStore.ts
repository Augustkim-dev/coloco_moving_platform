/**
 * 견적 요청 상태 관리 (Zustand)
 *
 * Single Source of Truth - 채팅/폼 모두 이 스토어를 참조/업데이트
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MovingSchema, PartialMovingSchema } from '@/types/schema';
import { createDefaultSchema } from '@/types/schema';
import {
  GuidedFlowEngine,
  createGuidedFlowEngine,
  setValueByPath,
  mergeSchema,
} from '@/lib/guided-flow/engine';
import { createClient } from '@/lib/supabase/client';

// ============================================
// 스토어 상태 타입
// ============================================

export interface EstimateState {
  // 스키마 데이터
  schema: MovingSchema;
  estimateId: string | null;
  isLoading: boolean;
  error: string | null;

  // 엔진 인스턴스 (persist 제외)
  engine: GuidedFlowEngine;

  // 액션
  setSchema: (schema: MovingSchema) => void;
  updateField: <K extends keyof MovingSchema>(
    section: K,
    data: Partial<MovingSchema[K]>
  ) => void;
  setFieldValue: (path: string, value: unknown, source?: 'guided' | 'chat' | 'form') => void;
  mergeSchema: (partial: PartialMovingSchema) => void;
  resetSchema: () => void;

  // AI 파싱 결과 적용
  applyAIUpdate: (
    updates: PartialMovingSchema,
    confidenceMap: Record<string, number>
  ) => void;

  // 진행 상태
  getCompletionRate: () => number;
  canSubmit: () => boolean;

  // DB 동기화
  syncToDatabase: () => Promise<void>;
  loadFromDatabase: (estimateId: string) => Promise<void>;

  // 유틸
  setEstimateId: (id: string | null) => void;
  setError: (error: string | null) => void;
}

// ============================================
// 스토어 생성
// ============================================

export const useEstimateStore = create<EstimateState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        schema: createDefaultSchema(),
        estimateId: null,
        isLoading: false,
        error: null,
        engine: createGuidedFlowEngine(),

        // 스키마 직접 설정
        setSchema: (schema) => {
          const engine = createGuidedFlowEngine(schema);
          set({ schema, engine });
        },

        // 섹션별 업데이트
        updateField: (section, data) => {
          const { schema, engine } = get();
          const updatedSchema = {
            ...schema,
            [section]: {
              ...schema[section],
              ...data,
            },
            meta: {
              ...schema.meta,
              updatedAt: new Date().toISOString(),
            },
          };

          engine.mergeSchemaUpdates({ [section]: data } as PartialMovingSchema);
          set({ schema: updatedSchema });
        },

        // dot notation 경로로 필드 업데이트
        setFieldValue: (path, value, source = 'form') => {
          const { schema } = get();
          const updatedSchema = setValueByPath(schema, path, value);

          // fieldConfidence 업데이트
          updatedSchema.status.fieldConfidence[path] = {
            value,
            confidence: 1.0, // 사용자 직접 입력은 confidence 1.0
            source,
          };

          updatedSchema.meta.updatedAt = new Date().toISOString();

          // 상태 재계산
          const engine = get().engine;
          engine.setFieldValue(path, value);

          set({
            schema: {
              ...updatedSchema,
              status: {
                ...updatedSchema.status,
                completionRate: engine.getCompletionRate(),
                missingRequired: engine.getMissingRequiredFields(),
                readyForSubmit: engine.canSubmit(),
              },
            },
          });
        },

        // 스키마 병합
        mergeSchema: (partial) => {
          const { schema, engine } = get();
          const updatedSchema = mergeSchema(schema, partial);
          updatedSchema.meta.updatedAt = new Date().toISOString();

          engine.mergeSchemaUpdates(partial);

          set({
            schema: {
              ...updatedSchema,
              status: {
                ...updatedSchema.status,
                completionRate: engine.getCompletionRate(),
                missingRequired: engine.getMissingRequiredFields(),
                readyForSubmit: engine.canSubmit(),
              },
            },
          });
        },

        // 스키마 초기화
        resetSchema: () => {
          const newSchema = createDefaultSchema();
          const engine = createGuidedFlowEngine(newSchema);
          set({
            schema: newSchema,
            estimateId: null,
            error: null,
            engine,
          });
        },

        // AI 파싱 결과 적용
        applyAIUpdate: (updates, confidenceMap) => {
          const { schema, engine } = get();

          // 1. 스키마 병합
          const updatedSchema = mergeSchema(schema, updates);

          // 2. fieldConfidence 업데이트
          for (const [path, confidence] of Object.entries(confidenceMap)) {
            const value = path.split('.').reduce(
              (obj, key) => (obj as Record<string, unknown>)?.[key],
              updatedSchema as unknown
            );

            updatedSchema.status.fieldConfidence[path] = {
              value,
              confidence,
              source: 'chat',
            };
          }

          updatedSchema.meta.updatedAt = new Date().toISOString();
          updatedSchema.meta.source = 'mixed';

          // 3. 엔진에 적용
          engine.applyAIParsedData(updates, confidenceMap);

          set({
            schema: {
              ...updatedSchema,
              status: {
                ...updatedSchema.status,
                completionRate: engine.getCompletionRate(),
                missingRequired: engine.getMissingRequiredFields(),
                readyForSubmit: engine.canSubmit(),
              },
            },
          });
        },

        // 진행률 조회
        getCompletionRate: () => {
          return get().engine.getCompletionRate();
        },

        // 제출 가능 여부
        canSubmit: () => {
          return get().engine.canSubmit();
        },

        // DB 동기화 (저장)
        syncToDatabase: async () => {
          const { schema, estimateId } = get();
          set({ isLoading: true, error: null });

          try {
            const supabase = createClient();

            if (estimateId) {
              // 기존 견적 업데이트
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { error } = await (supabase as any)
                .from('estimates')
                .update({
                  schema_data: schema,
                  completion_rate: schema.status.completionRate,
                  status: schema.status.readyForSubmit ? 'submitted' : 'draft',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', estimateId);

              if (error) throw error;
            } else {
              // 새 견적 생성
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data, error } = await (supabase as any)
                .from('estimates')
                .insert({
                  schema_data: schema,
                  phone: schema.contact.phone,
                  completion_rate: schema.status.completionRate,
                  status: schema.status.readyForSubmit ? 'submitted' : 'draft',
                })
                .select('id')
                .single();

              if (error) throw error;
              set({ estimateId: data.id });
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '저장 중 오류가 발생했습니다';
            set({ error: errorMessage });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        // DB에서 불러오기
        loadFromDatabase: async (estimateId) => {
          set({ isLoading: true, error: null });

          try {
            const supabase = createClient();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
              .from('estimates')
              .select('*')
              .eq('id', estimateId)
              .single();

            if (error) throw error;

            const schema = data.schema_data as MovingSchema;
            const engine = createGuidedFlowEngine(schema);

            set({
              schema,
              estimateId: data.id,
              engine,
            });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '불러오기 중 오류가 발생했습니다';
            set({ error: errorMessage });
            throw err;
          } finally {
            set({ isLoading: false });
          }
        },

        // 유틸
        setEstimateId: (id) => set({ estimateId: id }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'estimate-storage',
        // engine은 persist에서 제외 (함수 포함)
        partialize: (state) => ({
          schema: state.schema,
          estimateId: state.estimateId,
        }),
        // 복원 시 engine 재생성
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.engine = createGuidedFlowEngine(state.schema);
          }
        },
      }
    ),
    { name: 'EstimateStore' }
  )
);

// ============================================
// 셀렉터
// ============================================

/** 스키마 셀렉터 */
export const selectSchema = (state: EstimateState) => state.schema;

/** 진행률 셀렉터 */
export const selectCompletionRate = (state: EstimateState) =>
  state.schema.status.completionRate;

/** 제출 가능 여부 셀렉터 */
export const selectCanSubmit = (state: EstimateState) =>
  state.schema.status.readyForSubmit;

/** 누락 필드 셀렉터 */
export const selectMissingFields = (state: EstimateState) =>
  state.schema.status.missingRequired;

/** 로딩 상태 셀렉터 */
export const selectIsLoading = (state: EstimateState) => state.isLoading;

/** 에러 셀렉터 */
export const selectError = (state: EstimateState) => state.error;
