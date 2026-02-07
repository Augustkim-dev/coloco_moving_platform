'use client';

import { useFormContext } from 'react-hook-form';
import { MoveSection } from './MoveSection';
import { LocationSection } from './LocationSection';
import { CargoSection } from './CargoSection';
import { ServicesSection } from './ServicesSection';
import { ConditionsSection } from './ConditionsSection';
import { ContactSection } from './ContactSection';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEstimateStore } from '@/stores/estimateStore';
import type { EstimateFormData } from './FormSyncWrapper';
import { CheckCircle, AlertCircle } from 'lucide-react';

// 필드 경로를 한국어 라벨로 변환
const FIELD_LABELS: Record<string, string> = {
  'move.category': '주거 형태',
  'move.type': '이사 형태',
  'move.schedule': '이사 예정일',
  'move.timeSlot': '시작 시간',
  'departure.address': '출발지 주소',
  'departure.floor': '출발지 층수',
  'departure.hasElevator': '출발지 엘리베이터',
  'departure.squareFootage': '출발지 평수',
  'arrival.address': '도착지 주소',
  'arrival.floor': '도착지 층수',
  'arrival.hasElevator': '도착지 엘리베이터',
  'contact.name': '이름',
  'contact.phone': '연락처',
};

interface EstimateFormProps {
  onSubmit?: () => void;
}

export function EstimateForm({ onSubmit }: EstimateFormProps) {
  const { handleSubmit } = useFormContext<EstimateFormData>();
  const engine = useEstimateStore((state) => state.engine);

  const completionRate = engine.getCompletionRate() * 100; // 0~100으로 변환
  const canSubmit = engine.canSubmit();
  const missingFields = engine.getMissingRequiredFields();

  // 누락 필드를 한국어 라벨로 변환
  const missingFieldLabels = missingFields
    .slice(0, 3)
    .map((f) => FIELD_LABELS[f.field] || f.field);

  const handleFormSubmit = (data: EstimateFormData) => {
    console.log('Form submitted:', data);
    onSubmit?.();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 pb-24"
    >
      {/* 진행률 */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 -mx-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">입력 진행률</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(completionRate)}%
          </span>
        </div>
        <Progress value={completionRate} className="h-2" />
        {missingFields.length > 0 && (
          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>
              필수 항목: {missingFieldLabels.join(', ')}
              {missingFields.length > 3 && ` 외 ${missingFields.length - 3}개`}
            </span>
          </div>
        )}
      </div>

      {/* 이사 기본 정보 */}
      <MoveSection />

      {/* 출발지 */}
      <LocationSection type="departure" />

      {/* 도착지 */}
      <LocationSection type="arrival" />

      {/* 짐 정보 */}
      <CargoSection />

      {/* 부가 서비스 */}
      <ServicesSection />

      {/* 기타 조건 */}
      <ConditionsSection />

      {/* 연락처 */}
      <ContactSection />

      {/* 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!canSubmit}
        >
          {canSubmit ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              견적 요청하기
            </>
          ) : (
            <>필수 정보를 입력해주세요 ({Math.round(completionRate)}%)</>
          )}
        </Button>
      </div>
    </form>
  );
}
