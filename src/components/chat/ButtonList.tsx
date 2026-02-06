'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { StepOption } from '@/lib/guided-flow/steps';

interface ButtonListProps {
  options: StepOption[];
  onSelect: (value: string) => void;
  selectedValue?: string;
  className?: string;
}

export function ButtonList({
  options,
  onSelect,
  selectedValue,
  className,
}: ButtonListProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          variant={selectedValue === option.value ? 'default' : 'outline'}
          className={cn(
            'w-full justify-start text-left h-auto py-3 px-4',
            'hover:bg-primary/10 hover:border-primary',
            selectedValue === option.value && 'ring-2 ring-primary'
          )}
          onClick={() => onSelect(option.value)}
        >
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-medium">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground font-normal">
                {option.description}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}
