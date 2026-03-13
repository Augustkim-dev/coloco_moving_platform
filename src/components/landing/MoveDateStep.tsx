'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MoveDateStepProps {
  onSelect: (date: string) => void;
  selected?: string;
}

export function MoveDateStep({ onSelect, selected }: MoveDateStepProps) {
  const [dateValue, setDateValue] = useState<Date | undefined>(
    selected ? new Date(selected) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateValue(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      setTimeout(() => onSelect(formattedDate), 200);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">이사 예정일이 언제인가요?</h2>
        <p className="text-sm text-gray-500 mt-1">날짜가 확정되지 않았다면 대략적인 날짜를 선택해주세요</p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          locale={ko}
          disabled={(date) => date < today}
          className="rounded-xl border shadow-sm"
        />
      </div>

      <p className="text-xs text-center text-gray-400">
        * 이사 예정일을 선택해주세요
      </p>
    </div>
  );
}
