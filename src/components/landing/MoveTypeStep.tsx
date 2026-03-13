'use client';

import type { MoveType } from '@/types/schema';

const MOVE_TYPE_OPTIONS: { label: string; value: MoveType; description: string; tag?: string }[] = [
  {
    label: '용달이사',
    value: 'truck',
    description: '운반만 해드려요. 짐 포장과 정리는 직접 해야 해요',
    tag: '가장 저렴',
  },
  {
    label: '일반이사',
    value: 'general',
    description: '운반 + 큰 가구 배치까지 해드려요',
    tag: '인기',
  },
  {
    label: '반포장이사',
    value: 'half_pack',
    description: '큰 짐은 포장해드리고, 잔짐은 직접 포장해주세요',
  },
  {
    label: '포장이사',
    value: 'full_pack',
    description: '포장, 운반, 정리 모두 해드려요',
    tag: '프리미엄',
  },
  {
    label: '보관이사',
    value: 'storage',
    description: '짐을 일정 기간 보관 후 새 집으로 운반해드려요',
  },
];

interface MoveTypeStepProps {
  onSelect: (value: MoveType) => void;
  selected?: MoveType;
}

export function MoveTypeStep({ onSelect, selected }: MoveTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">어떤 이사를 원하시나요?</h2>
        <p className="text-sm text-gray-500 mt-1">서비스 범위에 따라 가격이 달라져요</p>
      </div>

      <div className="flex flex-col gap-3">
        {MOVE_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selected === option.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-gray-900">{option.label}</span>
              {option.tag && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  option.tag === '가장 저렴' ? 'bg-green-100 text-green-700' :
                  option.tag === '인기' ? 'bg-blue-100 text-blue-700' :
                  option.tag === '프리미엄' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {option.tag}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
