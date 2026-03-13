'use client';

import type { MoveCategory } from '@/types/schema';

const HOUSING_OPTIONS: { label: string; value: MoveCategory; description: string; icon: string }[] = [
  { label: '원룸', value: 'one_room', description: '원룸, 고시원', icon: '🏠' },
  { label: '투룸', value: 'two_room', description: '방 2개', icon: '🏠' },
  { label: '쓰리룸 이상', value: 'three_room_plus', description: '방 3개 이상', icon: '🏡' },
  { label: '오피스텔', value: 'officetel', description: '오피스텔', icon: '🏢' },
  { label: '아파트', value: 'apartment', description: '아파트', icon: '🏢' },
  { label: '빌라/주택', value: 'villa_house', description: '빌라, 연립, 단독주택', icon: '🏘️' },
  { label: '사무실', value: 'office', description: '사무실, 상가', icon: '🏛️' },
];

interface HousingTypeStepProps {
  onSelect: (value: MoveCategory) => void;
  selected?: MoveCategory;
}

export function HousingTypeStep({ onSelect, selected }: HousingTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">현재 주거 형태가 어떻게 되나요?</h2>
        <p className="text-sm text-gray-500 mt-1">이사할 곳의 형태를 선택해주세요</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {HOUSING_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              selected === option.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl mb-1">{option.icon}</span>
            <span className="font-semibold text-sm text-gray-900">{option.label}</span>
            <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
