'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEstimateStore } from '@/stores/estimateStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MOVE_TYPE_LABELS,
  MOVE_CATEGORY_LABELS,
  TIME_SLOT_LABELS,
  SQUARE_FOOTAGE_LABELS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_DATA,
} from '@/types/schema';
import {
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  Users,
  Truck,
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
  const missingFields = engine.getMissingRequiredFields();

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '미정';
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(date, 'M월 d일 (EEE)', { locale: ko });
    } catch {
      return dateStr;
    }
  };

  // 차량 정보
  const vehicleData = schema.conditions.vehicleType
    ? VEHICLE_DATA.find((v) => v.type === schema.conditions.vehicleType)
    : null;

  // 견적 제출
  const handleSubmit = async () => {
    if (!canSubmit || !termsAgreed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await syncToDatabase();
      router.push('/estimate/complete');
    } catch (err) {
      setError('견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 운반 방식 텍스트
  const getTransportText = (hasElevator: string) => {
    if (hasElevator === 'yes') return '엘리베이터';
    if (hasElevator === 'no') return '계단';
    return '';
  };

  // 주소 + 층수 조합
  const formatLocation = (
    address: string | null,
    detailAddress: string | null,
    floor: number | null,
    hasElevator: string
  ) => {
    const parts = [];
    if (address) parts.push(address);
    if (detailAddress) parts.push(detailAddress);
    const extra = [];
    if (floor !== null) extra.push(`${floor}층`);
    const transport = getTransportText(hasElevator);
    if (transport) extra.push(transport);
    if (extra.length > 0) parts.push(`(${extra.join(', ')})`);
    return parts.join(' ') || '미입력';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0 -ml-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">주문확인</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-32">
        {/* 누락 필드 알림 */}
        {missingFields.length > 0 && (
          <div className="mx-4 mt-3 p-3 bg-red-50 rounded-lg text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>누락된 필수 항목: {missingFields.map((f) => f.field).join(', ')}</span>
          </div>
        )}

        {/* 차량 정보 */}
        {vehicleData && (
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">선택: </span>
              <span className="font-bold text-gray-900">{vehicleData.name}</span>
              <span className="text-gray-400"> &gt;</span>
            </div>
            <div className="relative w-16 h-10">
              <Image
                src={vehicleData.image}
                alt={vehicleData.name}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* 출발지/도착지 */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-gray-400">&gt;어디서 나옵니까?</span>
              <p className="text-sm text-gray-800">
                {formatLocation(
                  schema.departure.address,
                  schema.departure.detailAddress,
                  schema.departure.floor,
                  schema.departure.hasElevator
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="text-xs text-gray-400">&gt;어디로 이사 가?</span>
              <p className="text-sm text-gray-800">
                {formatLocation(
                  schema.arrival.address,
                  schema.arrival.detailAddress,
                  schema.arrival.floor,
                  schema.arrival.hasElevator
                )}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* 이사 시간 */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">이사 시간</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-800">{formatDate(schema.move.schedule.date)}</span>
              {schema.move.timeSlot && schema.move.timeSlot !== 'unknown' && (
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                  {TIME_SLOT_LABELS[schema.move.timeSlot]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 고객 참여 */}
        {schema.conditions.customerParticipation !== null && (
          <>
            <Separator />
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">이사를 돕다</span>
                </div>
                <span className="text-sm text-gray-800">
                  {schema.conditions.customerParticipation ? '필요하다' : '불필요'}
                </span>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* 상세 정보 행들 */}
        <div className="px-4 py-3 space-y-3">
          {/* 이사형태 */}
          <InfoRow
            label="이사형태"
            value={
              schema.move.type && schema.move.type !== 'unknown'
                ? MOVE_TYPE_LABELS[schema.move.type]
                : '미선택'
            }
          />

          {/* 주거형태 */}
          <InfoRow
            label="주거형태"
            value={
              schema.move.category && schema.move.category !== 'unknown'
                ? MOVE_CATEGORY_LABELS[schema.move.category]
                : '미선택'
            }
          />

          {/* 평수 */}
          <InfoRow
            label="평수"
            value={
              schema.departure.squareFootage && schema.departure.squareFootage !== 'unknown'
                ? SQUARE_FOOTAGE_LABELS[schema.departure.squareFootage]
                : '미선택'
            }
          />

          {/* 차량 종류 */}
          {schema.conditions.vehicleType && (
            <InfoRow
              label="차량"
              value={VEHICLE_TYPE_LABELS[schema.conditions.vehicleType]}
            />
          )}

          {/* 차량 대수 */}
          {schema.conditions.vehiclePreference && schema.conditions.vehiclePreference !== 'unknown' && (
            <InfoRow
              label="차량 대수"
              value={`${schema.conditions.vehiclePreference}대`}
            />
          )}
        </div>

        <Separator />

        {/* 부가 서비스 */}
        <div className="px-4 py-3 space-y-3">
          {/* 기타 서비스 */}
          {(() => {
            const services = [];
            if (schema.services.airconInstall.needed) services.push('에어컨 이전');
            if (schema.services.cleaning) services.push('입주 청소');
            if (schema.services.organizing) services.push('정리 정돈');
            if (schema.services.disposal) services.push('폐기물 처리');
            if (schema.services.storage.needed) services.push('보관');
            return services.length > 0 ? (
              <InfoRow label="기타 서비스" value={services.join(', ')} />
            ) : null;
          })()}

          {/* 요청사항 */}
          {schema.conditions.extraRequests && (
            <InfoRow label="요청사항" value={schema.conditions.extraRequests} />
          )}
        </div>

        <Separator />

        {/* 연락처 */}
        <div className="px-4 py-3">
          <InfoRow
            label="연락처"
            value={`${schema.contact.name || '미입력'}    ${schema.contact.phone || '미입력'}`}
          />
        </div>

        <Separator />

        {/* 약관 동의 */}
        <div className="px-4 py-4">
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
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </main>

      {/* 하단 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
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
              주문확인
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

/** 컴팩트 정보 행 */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}
