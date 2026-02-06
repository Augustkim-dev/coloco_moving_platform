'use client';

import { useState } from 'react';
import type { GuidedStep } from '@/lib/guided-flow/steps';
import { ButtonList } from './ButtonList';
import { CardSelector } from './CardSelector';
import { FloorInput } from './FloorInput';
import { TipCard } from './TipCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GuidedStepRendererProps {
  step: GuidedStep;
  onAnswer: (value: unknown, displayText: string) => void;
}

export function GuidedStepRenderer({ step, onAnswer }: GuidedStepRendererProps) {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [textValue, setTextValue] = useState('');
  const [dateValue, setDateValue] = useState<Date | undefined>();

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    const option = step.options?.find((o) => o.value === value);
    const displayText = option?.label || value;
    onAnswer(value, displayText);
  };

  const handleTextSubmit = () => {
    if (textValue.trim()) {
      onAnswer(textValue.trim(), textValue.trim());
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateValue(date);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const displayText = format(date, 'M월 d일 (EEEE)', { locale: ko });
      onAnswer(
        { dateType: 'exact', date: formattedDate, dateFrom: null, dateTo: null },
        displayText
      );
    }
  };

  const renderInput = () => {
    switch (step.inputType) {
      case 'calendar':
        return (
          <div className="flex flex-col items-center gap-4">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              locale={ko}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
            <p className="text-xs text-muted-foreground">
              * 이사 예정일을 선택해주세요
            </p>
          </div>
        );

      case 'select':
        return (
          <Select onValueChange={handleSelect} value={selectedValue}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {step.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'card':
        return step.options ? (
          <CardSelector
            options={step.options}
            onSelect={handleSelect}
            selectedValue={selectedValue}
          />
        ) : null;

      case 'button_list':
        return step.options ? (
          <ButtonList
            options={step.options}
            onSelect={handleSelect}
            selectedValue={selectedValue}
          />
        ) : null;

      case 'number':
        return (
          <FloorInput
            onConfirm={(floor) => {
              const displayText =
                floor === 0
                  ? '반지하'
                  : floor < 0
                  ? `지하 ${Math.abs(floor)}층`
                  : `${floor}층`;
              onAnswer(floor, displayText);
            }}
          />
        );

      case 'text':
        return (
          <div className="flex flex-col gap-3">
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={step.placeholder || '내용을 입력해주세요'}
              className="min-h-[120px] resize-none"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className="w-full"
            >
              확인
            </Button>
          </div>
        );

      case 'toggle_list':
        return step.options ? (
          <div className="flex flex-col gap-2">
            {step.options.map((option) => (
              <Button
                key={option.value}
                variant={selectedValue.includes(option.value) ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  const values = selectedValue ? selectedValue.split(',') : [];
                  const newValues = values.includes(option.value)
                    ? values.filter((v) => v !== option.value)
                    : [...values, option.value];
                  setSelectedValue(newValues.join(','));
                }}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </Button>
            ))}
            <Button
              onClick={() => {
                const selectedOptions = selectedValue
                  .split(',')
                  .filter(Boolean)
                  .map((v) => step.options?.find((o) => o.value === v)?.label)
                  .filter(Boolean)
                  .join(', ');
                onAnswer(
                  selectedValue.split(',').filter(Boolean),
                  selectedOptions || '선택 없음'
                );
              }}
              className="w-full mt-2"
            >
              확인
            </Button>
          </div>
        ) : null;

      case 'address':
        // 주소 검색은 별도 컴포넌트로 구현 예정
        return (
          <div className="flex flex-col gap-3">
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={step.placeholder || '주소를 입력해주세요'}
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className="w-full"
            >
              확인
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              * 카카오 주소 검색은 추후 연동됩니다
            </p>
          </div>
        );

      case 'phone_verify':
        // SMS 인증은 별도 컴포넌트로 구현 예정
        return (
          <div className="flex flex-col gap-3">
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="이름, 휴대폰 번호를 입력해주세요"
              className="min-h-[80px] resize-none"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textValue.trim()}
              className="w-full"
            >
              확인
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              * SMS 인증은 추후 연동됩니다
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 팁 카드 */}
      {step.tipCard && <TipCard tip={step.tipCard} />}

      {/* 설명 */}
      {step.description && (
        <p className="text-sm text-muted-foreground">{step.description}</p>
      )}

      {/* 입력 UI */}
      {renderInput()}

      {/* 도움말 링크 */}
      {step.helpLink && (
        <a
          href={step.helpLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary underline self-center"
        >
          {step.helpLink.label}
        </a>
      )}
    </div>
  );
}
