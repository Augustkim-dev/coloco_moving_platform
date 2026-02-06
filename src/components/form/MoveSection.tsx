'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import type { MoveCategory, MoveType, TimeSlot } from '@/types/schema';
import {
  MOVE_CATEGORY_LABELS,
  MOVE_TYPE_LABELS,
  TIME_SLOT_LABELS,
} from '@/types/schema';
import type { EstimateFormData } from './FormSyncWrapper';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function MoveSection() {
  const { watch, setValue } = useFormContext<EstimateFormData>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const category = watch('move.category');
  const type = watch('move.type');
  const schedule = watch('move.schedule');
  const timeSlot = watch('move.timeSlot');

  const selectedDate = schedule
    ? parse(schedule, 'yyyy-MM-dd', new Date())
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('move.schedule', format(date, 'yyyy-MM-dd'));
      setCalendarOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">이사 기본 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이사 예정일 */}
        <div className="space-y-2">
          <Label>이사 예정일</Label>
          <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {schedule
                  ? format(selectedDate!, 'yyyy년 M월 d일 (EEEE)', {
                      locale: ko,
                    })
                  : '날짜를 선택하세요'}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-auto p-0">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>이사 예정일 선택</DialogTitle>
              </DialogHeader>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* 이사 형태 */}
        <div className="space-y-2">
          <Label>이사 형태</Label>
          <Select
            value={type || undefined}
            onValueChange={(value) =>
              setValue('move.type', value as MoveType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="이사 형태를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MOVE_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 주거 형태 */}
        <div className="space-y-2">
          <Label>주거 형태</Label>
          <Select
            value={category || undefined}
            onValueChange={(value) =>
              setValue('move.category', value as MoveCategory)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="주거 형태를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MOVE_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 시작 시간대 */}
        <div className="space-y-2">
          <Label>시작 시간대</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TIME_SLOT_LABELS).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={timeSlot === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('move.timeSlot', value as TimeSlot)}
                className="justify-start"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
