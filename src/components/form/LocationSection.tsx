'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EstimateFormData } from './FormSyncWrapper';
import { MapPin, Truck } from 'lucide-react';

interface LocationSectionProps {
  type: 'departure' | 'arrival';
}

type TransportMethod = 'elevator' | 'stairs' | 'ladder';

const SQUARE_FOOTAGE_OPTIONS = [
  { value: 10, label: '10평 미만' },
  { value: 15, label: '10~15평' },
  { value: 20, label: '15~20평' },
  { value: 25, label: '20~25평' },
  { value: 30, label: '25~30평' },
  { value: 35, label: '30~35평' },
  { value: 40, label: '35~40평' },
  { value: 50, label: '40~50평' },
  { value: 60, label: '50평 이상' },
];

export function LocationSection({ type }: LocationSectionProps) {
  const { watch, setValue } = useFormContext<EstimateFormData>();
  const title = type === 'departure' ? '출발지 정보' : '도착지 정보';

  // 출발지/도착지 데이터 직접 접근
  const locationData = watch(type);
  const ladderTruck = watch('services.ladderTruck');

  // 현재 운반 방식 결정
  const getTransportMethod = (): TransportMethod | null => {
    const isLadderSelected = type === 'departure'
      ? ladderTruck?.departure
      : ladderTruck?.arrival;

    if (isLadderSelected) return 'ladder';
    if (locationData?.hasElevator === true) return 'elevator';
    if (locationData?.hasElevator === false) return 'stairs';
    return null;
  };

  const handleTransportMethodChange = (method: TransportMethod) => {
    if (method === 'ladder') {
      // 사다리차 선택: hasElevator를 false로, ladderTruck 설정
      setValue(`${type}.hasElevator`, false);
      setValue('services.ladderTruck.needed', true);
      setValue(`services.ladderTruck.${type}`, true);
    } else if (method === 'elevator') {
      // 엘리베이터 선택
      setValue(`${type}.hasElevator`, true);
      setValue(`services.ladderTruck.${type}`, false);
      // 둘 다 false면 needed도 false
      const otherType = type === 'departure' ? 'arrival' : 'departure';
      if (!ladderTruck?.[otherType]) {
        setValue('services.ladderTruck.needed', false);
      }
    } else {
      // 계단 선택
      setValue(`${type}.hasElevator`, false);
      setValue(`services.ladderTruck.${type}`, false);
      const otherType = type === 'departure' ? 'arrival' : 'departure';
      if (!ladderTruck?.[otherType]) {
        setValue('services.ladderTruck.needed', false);
      }
    }
  };

  const currentMethod = getTransportMethod();

  const handleAddressSearch = () => {
    // TODO: 카카오 주소 검색 연동
    alert('주소 검색 기능은 추후 연동 예정입니다.');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 주소 검색 */}
        <div className="space-y-2">
          <Label>주소</Label>
          <div className="flex gap-2">
            <Input
              value={locationData?.address || ''}
              placeholder="주소를 검색하세요"
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddressSearch}
            >
              검색
            </Button>
          </div>
          <Input
            value={locationData?.addressDetail || ''}
            onChange={(e) =>
              setValue(`${type}.addressDetail`, e.target.value)
            }
            placeholder="상세 주소 (동/호수)"
          />
        </div>

        {/* 평수 (출발지만) */}
        {type === 'departure' && (
          <div className="space-y-2">
            <Label>평수</Label>
            <Select
              value={locationData?.squareFootage?.toString() || undefined}
              onValueChange={(value) =>
                setValue('departure.squareFootage', parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="평수를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {SQUARE_FOOTAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 운반 방식 */}
        <div className="space-y-2">
          <Label>운반 방식</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={currentMethod === 'elevator' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTransportMethodChange('elevator')}
            >
              엘리베이터
            </Button>
            <Button
              type="button"
              variant={currentMethod === 'stairs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTransportMethodChange('stairs')}
            >
              계단
            </Button>
            <Button
              type="button"
              variant={currentMethod === 'ladder' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTransportMethodChange('ladder')}
              className="flex items-center gap-1"
            >
              <Truck className="h-3 w-3" />
              사다리차
            </Button>
          </div>
        </div>

        {/* 층수 */}
        <div className="space-y-2">
          <Label>층수</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={locationData?.floor ?? ''}
              onChange={(e) =>
                setValue(
                  `${type}.floor`,
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder="층수 입력"
              min={-5}
              max={100}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              층 (지하는 음수로 입력)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
