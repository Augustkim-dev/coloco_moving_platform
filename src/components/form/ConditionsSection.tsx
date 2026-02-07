'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { EstimateFormData } from './FormSyncWrapper';
import { Truck, Users, MessageSquare } from 'lucide-react';

export function ConditionsSection() {
  const { watch, setValue } = useFormContext<EstimateFormData>();

  const conditions = watch('conditions');
  const moveType = watch('move.type');

  // 용달/일반이사일 때만 트럭 대수와 고객 참여 표시
  const showTruckOptions = moveType === 'truck' || moveType === 'general';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          기타 조건
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 트럭 대수 */}
        {showTruckOptions && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">트럭 대수</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={conditions?.vehiclePreference === '1' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('conditions.vehiclePreference', '1')}
              >
                1대
              </Button>
              <Button
                type="button"
                variant={conditions?.vehiclePreference === '2' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('conditions.vehiclePreference', '2')}
              >
                2대
              </Button>
              <Button
                type="button"
                variant={conditions?.vehiclePreference === 'unknown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setValue('conditions.vehiclePreference', 'unknown')}
              >
                모르겠어요
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              양문형 냉장고, 옷장, 침대, 소파 중 3개 이상이면 2대를 추천해요
            </p>
          </div>
        )}

        {/* 고객 참여 */}
        {showTruckOptions && (
          <div className="flex items-start justify-between gap-4 py-3 border-t">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium">짐 운반 참여</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  함께 작업하면 비용이 절약돼요
                </p>
              </div>
            </div>
            <Switch
              checked={conditions?.customerParticipation || false}
              onCheckedChange={(checked) =>
                setValue('conditions.customerParticipation', checked)
              }
            />
          </div>
        )}

        {/* 요청사항 */}
        <div className="space-y-2 pt-2">
          <Label className="text-sm font-medium">요청사항</Label>
          <Textarea
            value={conditions?.extraRequests || ''}
            onChange={(e) => setValue('conditions.extraRequests', e.target.value)}
            placeholder="짐 정보나 특별한 요청사항을 적어주세요&#10;예: 피아노가 있어요, 오후 3시 이후 연락 부탁드려요"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
