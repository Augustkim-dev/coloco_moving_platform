'use client';

import { cn } from '@/lib/utils';
import type { TipCard as TipCardType } from '@/lib/guided-flow/steps';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface TipCardProps {
  tip: TipCardType;
  className?: string;
}

const badgeColorMap = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  green: 'bg-green-100 text-green-700 hover:bg-green-100',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
};

export function TipCard({ tip, className }: TipCardProps) {
  return (
    <Card className={cn('bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* 아이콘 또는 일러스트 */}
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            {tip.illustration ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tip.illustration}
                alt=""
                className="w-6 h-6"
              />
            ) : (
              <Lightbulb className="w-5 h-5 text-amber-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* 뱃지 */}
            <Badge
              variant="secondary"
              className={cn(
                'mb-2 font-medium',
                badgeColorMap[tip.badgeColor]
              )}
            >
              {tip.badge}
            </Badge>

            {/* 제목 */}
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {tip.title}
            </h4>

            {/* 설명 */}
            <p className="text-xs text-muted-foreground">
              {tip.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
