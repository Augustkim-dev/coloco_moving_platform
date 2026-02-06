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
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)}>
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
            <CardContent className="p-4 relative">
              {/* 선택 체크 표시 */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
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
              <h4 className="font-semibold text-sm mb-1">{option.label}</h4>

              {/* 설명 */}
              {option.description && (
                <p className="text-xs text-muted-foreground">
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
