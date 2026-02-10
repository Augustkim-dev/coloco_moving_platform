'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StepOption } from '@/lib/guided-flow/steps';
import { Check } from 'lucide-react';

interface CardSelectorProps {
  options: StepOption[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  className?: string;
}

export function CardSelector({
  options,
  onSelect,
  selectedValue,
  className,
}: CardSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <Card
            key={option.value}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              'active:scale-[0.98]',
              isSelected
                ? 'border-primary ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelect(option.value)}
          >
            <CardContent className="p-2.5 relative">
              {/* 선택 체크 표시 */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}

              {/* 태그들 */}
              {option.tags && option.tags.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {option.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 레이블 */}
              <h4 className="font-medium text-sm mb-0.5">{option.label}</h4>

              {/* 설명 */}
              {option.description && (
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {option.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
