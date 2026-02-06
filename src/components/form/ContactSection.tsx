'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Carrier } from '@/types/schema';
import { CARRIER_LABELS } from '@/types/schema';
import type { EstimateFormData } from './FormSyncWrapper';
import { User, Phone } from 'lucide-react';

export function ContactSection() {
  const { watch, setValue } = useFormContext<EstimateFormData>();

  const name = watch('contact.name');
  const phone = watch('contact.phone');
  const carrier = watch('contact.carrier');

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('contact.phone', formatted);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          연락처 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="contact-name">이름</Label>
          <Input
            id="contact-name"
            value={name || ''}
            onChange={(e) => setValue('contact.name', e.target.value)}
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 전화번호 */}
        <div className="space-y-2">
          <Label htmlFor="contact-phone">휴대폰 번호</Label>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Input
              id="contact-phone"
              type="tel"
              value={phone || ''}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              maxLength={13}
              className="flex-1"
            />
          </div>
        </div>

        {/* 통신사 */}
        <div className="space-y-2">
          <Label>통신사</Label>
          <Select
            value={carrier || undefined}
            onValueChange={(value) => setValue('contact.carrier', value as Carrier)}
          >
            <SelectTrigger>
              <SelectValue placeholder="통신사를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CARRIER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          * 견적 확인 및 이사 일정 조율을 위해 연락드립니다.
        </p>
      </CardContent>
    </Card>
  );
}
