'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EstimateFormData } from './FormSyncWrapper';
import { Wrench, Truck, Wind, Sparkles, Warehouse, Trash2 } from 'lucide-react';

export function ServicesSection() {
  const { watch, setValue } = useFormContext<EstimateFormData>();

  const services = watch('services');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          부가 서비스
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 사다리차 */}
        <div className="flex items-start justify-between gap-4 py-3 border-b">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label className="text-sm font-medium">사다리차</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                엘리베이터 이용 불가 시 필요
              </p>
            </div>
          </div>
          <Toggle
            pressed={services?.ladderTruck?.needed || false}
            onPressedChange={(pressed) =>
              setValue('services.ladderTruck', {
                ...services?.ladderTruck,
                needed: pressed,
              })
            }
            aria-label="사다리차 필요 여부"
          />
        </div>

        {services?.ladderTruck?.needed && (
          <div className="pl-8 space-y-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={services?.ladderTruck?.departure || false}
                  onChange={(e) =>
                    setValue('services.ladderTruck.departure', e.target.checked)
                  }
                  className="rounded"
                />
                출발지
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={services?.ladderTruck?.arrival || false}
                  onChange={(e) =>
                    setValue('services.ladderTruck.arrival', e.target.checked)
                  }
                  className="rounded"
                />
                도착지
              </label>
            </div>
          </div>
        )}

        {/* 에어컨 설치 */}
        <div className="flex items-start justify-between gap-4 py-3 border-b">
          <div className="flex items-start gap-3">
            <Wind className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label className="text-sm font-medium">에어컨 이전 설치</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                이전 및 재설치 서비스
              </p>
            </div>
          </div>
          <Toggle
            pressed={services?.airconInstall?.needed || false}
            onPressedChange={(pressed) =>
              setValue('services.airconInstall', {
                ...services?.airconInstall,
                needed: pressed,
              })
            }
            aria-label="에어컨 설치 필요 여부"
          />
        </div>

        {services?.airconInstall?.needed && (
          <div className="pl-8">
            <Label className="text-sm">에어컨 대수</Label>
            <Input
              type="number"
              value={services?.airconInstall?.count || 1}
              onChange={(e) =>
                setValue(
                  'services.airconInstall.count',
                  parseInt(e.target.value) || 1
                )
              }
              min={1}
              max={10}
              className="w-20 mt-1"
            />
          </div>
        )}

        {/* 청소 서비스 */}
        <div className="flex items-start justify-between gap-4 py-3 border-b">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label className="text-sm font-medium">청소 서비스</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                입주/퇴거 청소
              </p>
            </div>
          </div>
          <Toggle
            pressed={services?.cleaning?.needed || false}
            onPressedChange={(pressed) =>
              setValue('services.cleaning', {
                ...services?.cleaning,
                needed: pressed,
              })
            }
            aria-label="청소 서비스 필요 여부"
          />
        </div>

        {services?.cleaning?.needed && (
          <div className="pl-8">
            <Select
              value={services?.cleaning?.type || undefined}
              onValueChange={(value) => setValue('services.cleaning.type', value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="청소 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="departure">출발지 청소</SelectItem>
                <SelectItem value="arrival">도착지 청소</SelectItem>
                <SelectItem value="both">양쪽 청소</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 보관 이사 */}
        <div className="flex items-start justify-between gap-4 py-3 border-b">
          <div className="flex items-start gap-3">
            <Warehouse className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label className="text-sm font-medium">보관 서비스</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                짐 임시 보관
              </p>
            </div>
          </div>
          <Toggle
            pressed={services?.storage?.needed || false}
            onPressedChange={(pressed) =>
              setValue('services.storage', {
                ...services?.storage,
                needed: pressed,
              })
            }
            aria-label="보관 서비스 필요 여부"
          />
        </div>

        {services?.storage?.needed && (
          <div className="pl-8">
            <Select
              value={services?.storage?.duration || undefined}
              onValueChange={(value) =>
                setValue('services.storage.duration', value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="보관 기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">1주일</SelectItem>
                <SelectItem value="2weeks">2주일</SelectItem>
                <SelectItem value="1month">1개월</SelectItem>
                <SelectItem value="2months">2개월</SelectItem>
                <SelectItem value="3months">3개월 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 폐기물 처리 */}
        <div className="flex items-start justify-between gap-4 py-3">
          <div className="flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <Label className="text-sm font-medium">폐기물 처리</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                대형 폐기물 수거
              </p>
            </div>
          </div>
          <Toggle
            pressed={services?.disposal?.needed || false}
            onPressedChange={(pressed) =>
              setValue('services.disposal', {
                ...services?.disposal,
                needed: pressed,
              })
            }
            aria-label="폐기물 처리 필요 여부"
          />
        </div>
      </CardContent>
    </Card>
  );
}
