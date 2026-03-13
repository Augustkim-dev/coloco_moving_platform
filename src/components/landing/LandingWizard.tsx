'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import type { MoveCategory, SquareFootage, MoveType, VehicleType } from '@/types/schema';
import { useEstimateStore } from '@/stores/estimateStore';
import { useChatStore } from '@/stores/chatStore';
import { HousingTypeStep } from './HousingTypeStep';
import { SquareFootageStep } from './SquareFootageStep';
import { MoveTypeStep } from './MoveTypeStep';
import { VehicleSelectStep } from './VehicleSelectStep';
import { ManchaloLogo } from '@/components/brand/ManchaloLogo';

const STEP_TITLES = ['주거형태', '평수', '이사형태', '차량선택'];

export function LandingWizard() {
  const router = useRouter();
  const prefillFromLanding = useEstimateStore((s) => s.prefillFromLanding);
  const clearChat = useChatStore((s) => s.clearChat);

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<MoveCategory | undefined>();
  const [squareFootage, setSquareFootage] = useState<SquareFootage | undefined>();
  const [moveType, setMoveType] = useState<MoveType | undefined>();

  const handleHousingSelect = (value: MoveCategory) => {
    setCategory(value);
    setTimeout(() => setStep(1), 200);
  };

  const handleFootageSelect = (value: SquareFootage) => {
    setSquareFootage(value);
    setTimeout(() => setStep(2), 200);
  };

  const handleMoveTypeSelect = (value: MoveType) => {
    setMoveType(value);
    setTimeout(() => setStep(3), 200);
  };

  const handleVehicleSelect = (value: VehicleType) => {
    if (!category || !squareFootage || !moveType) return;

    // 스토어에 사전 입력 반영 + 채팅 초기화
    clearChat();
    prefillFromLanding({
      category,
      squareFootage,
      moveType,
      vehicleType: value,
    });

    router.push('/estimate');
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        {step > 0 ? (
          <button onClick={handleBack} className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-7" />
        )}
        <div className="flex-1 flex justify-center">
          <ManchaloLogo size="sm" />
        </div>
        <div className="w-7" />
      </header>

      {/* 진행 표시 */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          {STEP_TITLES.map((title, i) => (
            <div key={title} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step
                    ? 'bg-primary text-white'
                    : i === step
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${
                i === step ? 'text-primary font-medium' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {i < STEP_TITLES.length - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-1 ${
                  i < step ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 스텝 컨텐츠 */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {step === 0 && (
          <HousingTypeStep onSelect={handleHousingSelect} selected={category} />
        )}
        {step === 1 && (
          <SquareFootageStep onSelect={handleFootageSelect} selected={squareFootage} />
        )}
        {step === 2 && (
          <MoveTypeStep onSelect={handleMoveTypeSelect} selected={moveType} />
        )}
        {step === 3 && (
          <VehicleSelectStep onSelect={handleVehicleSelect} />
        )}
      </main>
    </div>
  );
}
