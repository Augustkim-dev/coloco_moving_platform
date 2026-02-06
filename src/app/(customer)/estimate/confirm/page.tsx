'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEstimateStore } from '@/stores/estimateStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MOVE_TYPE_LABELS,
  MOVE_CATEGORY_LABELS,
  TIME_SLOT_LABELS,
} from '@/types/schema';
import {
  Calendar,
  MapPin,
  Building,
  Truck,
  User,
  Phone,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function EstimateConfirmPage() {
  const router = useRouter();
  const schema = useEstimateStore((state) => state.schema);
  const engine = useEstimateStore((state) => state.engine);
  const syncToDatabase = useEstimateStore((state) => state.syncToDatabase);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = engine.canSubmit();
  const completionRate = engine.getCompletionRate();
  const missingFields = engine.getMissingRequiredFields();

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '미정';
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(date, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
    } catch {
      return dateStr;
    }
  };

  // 견적 제출
  const handleSubmit = async () => {
    if (!canSubmit || !termsAgreed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await syncToDatabase();
      // 성공 시 완료 페이지로 이동
      router.push('/estimate/complete');
    } catch (err) {
      setError('견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/30">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">견적 정보 확인</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-4 space-y-4 pb-32">
        {/* 진행률 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">입력 완료율</span>
              <Badge variant={canSubmit ? 'default' : 'secondary'}>
                {Math.round(completionRate)}%
              </Badge>
            </div>
            {missingFields.length > 0 && (
              <div className="mt-2 text-xs text-destructive flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                  누락된 필수 항목: {missingFields.join(', ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이사 기본 정보 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              이사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatDate(schema.move.schedule.date)}
              </span>
              {schema.move.timeSlot && schema.move.timeSlot !== 'unknown' && (
                <Badge variant="outline" className="text-xs">
                  {TIME_SLOT_LABELS[schema.move.timeSlot]}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">이사 형태: </span>
                <span>
                  {schema.move.type && schema.move.type !== 'unknown'
                    ? MOVE_TYPE_LABELS[schema.move.type]
                    : '미선택'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">주거 형태: </span>
                <span>
                  {schema.move.category && schema.move.category !== 'unknown'
                    ? MOVE_CATEGORY_LABELS[schema.move.category]
                    : '미선택'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 출발지 정보 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              출발지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{schema.departure.address || '주소 미입력'}</p>
            {schema.departure.detailAddress && (
              <p className="text-muted-foreground">
                {schema.departure.detailAddress}
              </p>
            )}
            <div className="flex gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {schema.departure.floor !== null
                  ? `${schema.departure.floor}층`
                  : '층수 미입력'}
              </span>
              <span>
                {schema.departure.hasElevator === 'yes'
                  ? '엘리베이터'
                  : schema.departure.hasElevator === 'no'
                  ? '계단'
                  : '운반방식 미선택'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 도착지 정보 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              도착지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{schema.arrival.address || '주소 미입력'}</p>
            {schema.arrival.detailAddress && (
              <p className="text-muted-foreground">
                {schema.arrival.detailAddress}
              </p>
            )}
            <div className="flex gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                {schema.arrival.floor !== null
                  ? `${schema.arrival.floor}층`
                  : '층수 미입력'}
              </span>
              <span>
                {schema.arrival.hasElevator === 'yes'
                  ? '엘리베이터'
                  : schema.arrival.hasElevator === 'no'
                  ? '계단'
                  : '운반방식 미선택'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 정보 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              연락처
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{schema.contact.name || '이름 미입력'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{schema.contact.phone || '연락처 미입력'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 요청사항 */}
        {schema.conditions.extraRequests && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">요청사항</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {schema.conditions.extraRequests}
              </p>
            </CardContent>
          </Card>
        )}

        {/* 약관 동의 */}
        <Card>
          <CardContent className="p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded"
              />
              <div className="text-sm">
                <span className="font-medium">이용약관 및 개인정보 처리방침</span>
                <span className="text-muted-foreground">에 동의합니다.</span>
                <p className="text-xs text-muted-foreground mt-1">
                  견적 비교를 위해 입력하신 정보가 이사업체에 전달됩니다.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-sm text-destructive flex items-center gap-2 px-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </main>

      {/* 하단 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmit || !termsAgreed || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              견적 요청 중...
            </>
          ) : canSubmit && termsAgreed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              견적 요청하기
            </>
          ) : !canSubmit ? (
            '필수 정보를 입력해주세요'
          ) : (
            '약관에 동의해주세요'
          )}
        </Button>
      </div>
    </div>
  );
}
