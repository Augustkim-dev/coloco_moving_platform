'use client';

import { useFormContext } from 'react-hook-form';
import { MoveSection } from './MoveSection';
import { LocationSection } from './LocationSection';
import { CargoSection } from './CargoSection';
import { ServicesSection } from './ServicesSection';
import { ContactSection } from './ContactSection';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEstimateStore } from '@/stores/estimateStore';
import type { EstimateFormData } from './FormSyncWrapper';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EstimateFormProps {
  onSubmit?: () => void;
}

export function EstimateForm({ onSubmit }: EstimateFormProps) {
  const { handleSubmit } = useFormContext<EstimateFormData>();
  const engine = useEstimateStore((state) => state.engine);

  const completionRate = engine.getCompletionRate();
  const canSubmit = engine.canSubmit();
  const missingFields = engine.getMissingRequiredFields();

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
              필수 항목: {missingFields.slice(0, 3).join(', ')}
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
