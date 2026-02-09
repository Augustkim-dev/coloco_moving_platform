'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CARRIER_LABELS } from '@/types/schema';
import type { Carrier } from '@/types/schema';
import { Phone, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface PhoneVerificationProps {
  onVerified: (data: { phone: string; carrier: Carrier }) => void;
  initialPhone?: string;
  initialCarrier?: Carrier | null;
}

type VerificationStep = 'input' | 'verify' | 'complete';

export function PhoneVerification({
  onVerified,
  initialPhone = '',
  initialCarrier = null,
}: PhoneVerificationProps) {
  const [step, setStep] = useState<VerificationStep>('input');
  const [phone, setPhone] = useState(initialPhone);
  const [carrier, setCarrier] = useState<Carrier | null>(initialCarrier);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
    setError(null);
  };

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 인증번호 발송
  const sendVerificationCode = useCallback(async () => {
    if (!phone || phone.replace(/-/g, '').length < 10) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/-/g, '') }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '인증번호 발송에 실패했습니다.');
      }

      setStep('verify');
      setCountdown(180); // 3분 타이머
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  // 인증번호 확인
  const verifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/-/g, ''),
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '인증에 실패했습니다.');
      }

      setStep('complete');
      onVerified({
        phone,
        carrier: carrier || 'SKT',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, verificationCode, carrier, onVerified]);

  // 인증 완료 상태
  if (step === 'complete') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">본인 인증 완료</p>
              <p className="text-sm text-green-600">{phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Phone className="h-4 w-4" />
          본인 인증
        </div>

        {step === 'input' && (
          <>
            {/* 전화번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="phone">휴대폰 번호</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
              />
            </div>

            {/* 통신사 선택 */}
            <div className="space-y-2">
              <Label>통신사</Label>
              <Select
                value={carrier || undefined}
                onValueChange={(value) => setCarrier(value as Carrier)}
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

            {/* 에러 메시지 */}
            {error && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* 인증번호 발송 버튼 */}
            <Button
              className="w-full"
              onClick={sendVerificationCode}
              disabled={isLoading || !phone || !carrier}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  발송 중...
                </>
              ) : (
                '인증번호 발송'
              )}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <p className="text-sm text-muted-foreground">
              {phone}로 발송된 인증번호를 입력해주세요.
            </p>

            {/* 인증번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="code">인증번호</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError(null);
                  }}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                  className="flex-1"
                />
                {countdown > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground min-w-[60px]">
                    {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* 버튼 그룹 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('input');
                  setVerificationCode('');
                  setError(null);
                }}
                disabled={isLoading}
              >
                다시 입력
              </Button>
              <Button
                className="flex-1"
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length < 4}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  '인증 확인'
                )}
              </Button>
            </div>

            {/* 재발송 */}
            {countdown === 0 && (
              <Button
                variant="link"
                className="w-full"
                onClick={sendVerificationCode}
                disabled={isLoading}
              >
                인증번호 재발송
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
