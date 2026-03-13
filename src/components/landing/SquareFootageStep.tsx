'use client';

import type { SquareFootage } from '@/types/schema';

const FOOTAGE_OPTIONS: { label: string; value: SquareFootage }[] = [
  { label: '10평 이하', value: 'under_10' },
  { label: '10~15평', value: '10_15' },
  { label: '15~25평', value: '15_25' },
  { label: '25~35평', value: '25_35' },
  { label: '35~45평', value: '35_45' },
  { label: '45평 이상', value: 'over_45' },
  { label: '모르겠어요', value: 'unknown' },
];

interface SquareFootageStepProps {
  onSelect: (value: SquareFootage) => void;
  selected?: SquareFootage;
}

export function SquareFootageStep({ onSelect, selected }: SquareFootageStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">현재 평수는 어떻게 되나요?</h2>
        <p className="text-sm text-gray-500 mt-1">현재 살고 계신 곳의 평수를 선택해주세요</p>
      </div>

      <div className="flex flex-col gap-2">
        {FOOTAGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full py-3 px-4 rounded-xl border-2 text-left font-medium transition-all ${
              selected === option.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
