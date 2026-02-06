'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { EstimateFormData } from './FormSyncWrapper';
import { Package, Plus, X } from 'lucide-react';
import { useState } from 'react';

const COMMON_APPLIANCES = [
  '냉장고',
  '세탁기',
  '에어컨',
  'TV',
  '컴퓨터',
  '전자레인지',
  '청소기',
  '건조기',
];

const COMMON_FURNITURE = [
  '침대',
  '옷장',
  '책상',
  '소파',
  '식탁',
  '서랍장',
  '책장',
  '화장대',
];

const COMMON_SPECIAL = [
  '피아노',
  '금고',
  '대형 어항',
  '운동기구',
  '예술품',
  '골동품',
];

export function CargoSection() {
  const { watch, setValue } = useFormContext<EstimateFormData>();
  const [customItem, setCustomItem] = useState('');

  const appliances = watch('cargo.appliances') || [];
  const furniture = watch('cargo.furniture') || [];
  const special = watch('cargo.special') || [];
  const boxes = watch('cargo.boxes') || { small: 0, medium: 0, large: 0 };

  const toggleItem = (
    category: 'appliances' | 'furniture' | 'special',
    item: string
  ) => {
    const current = watch(`cargo.${category}`) || [];
    const updated = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setValue(`cargo.${category}`, updated);
  };

  const addCustomItem = (category: 'appliances' | 'furniture' | 'special') => {
    if (!customItem.trim()) return;
    const current = watch(`cargo.${category}`) || [];
    if (!current.includes(customItem.trim())) {
      setValue(`cargo.${category}`, [...current, customItem.trim()]);
    }
    setCustomItem('');
  };

  const updateBoxCount = (size: 'small' | 'medium' | 'large', delta: number) => {
    const current = boxes[size] || 0;
    const newValue = Math.max(0, current + delta);
    setValue('cargo.boxes', { ...boxes, [size]: newValue });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Package className="h-4 w-4" />짐 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 가전제품 */}
        <div className="space-y-2">
          <Label>가전제품</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_APPLIANCES.map((item) => (
              <Badge
                key={item}
                variant={appliances.includes(item) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem('appliances', item)}
              >
                {item}
              </Badge>
            ))}
            {appliances
              .filter((item: string) => !COMMON_APPLIANCES.includes(item))
              .map((item: string) => (
                <Badge
                  key={item}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleItem('appliances', item)}
                >
                  {item}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              placeholder="기타 가전제품"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem('appliances');
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => addCustomItem('appliances')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 가구 */}
        <div className="space-y-2">
          <Label>가구</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_FURNITURE.map((item) => (
              <Badge
                key={item}
                variant={furniture.includes(item) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem('furniture', item)}
              >
                {item}
              </Badge>
            ))}
            {furniture
              .filter((item: string) => !COMMON_FURNITURE.includes(item))
              .map((item: string) => (
                <Badge
                  key={item}
                  variant="default"
                  className="cursor-pointer"
                  onClick={() => toggleItem('furniture', item)}
                >
                  {item}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
          </div>
        </div>

        {/* 특수품목 */}
        <div className="space-y-2">
          <Label>특수품목 (추가 요금 발생 가능)</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SPECIAL.map((item) => (
              <Badge
                key={item}
                variant={special.includes(item) ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleItem('special', item)}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* 박스 수량 */}
        <div className="space-y-2">
          <Label>예상 박스 수량</Label>
          <div className="grid grid-cols-3 gap-4">
            {(['small', 'medium', 'large'] as const).map((size) => {
              const labels = {
                small: '소형',
                medium: '중형',
                large: '대형',
              };
              return (
                <div key={size} className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    {labels[size]}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateBoxCount(size, -1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{boxes[size] || 0}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateBoxCount(size, 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * 소형: 책, 옷 / 중형: 잡화 / 대형: 이불, 계절용품
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
