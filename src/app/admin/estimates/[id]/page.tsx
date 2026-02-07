import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssignmentStatusWrapper } from '@/components/admin/AssignmentStatusWrapper'
import {
  ArrowLeft,
  User,
  MapPin,
  Truck,
  Package,
  Building2,
} from 'lucide-react'
import type { Database } from '@/types/database'
import type { MovingSchema } from '@/types/schema'
import type { MatchingWithCompany } from '@/types/matching'

type Estimate = Database['public']['Tables']['estimates']['Row']
type Company = Database['public']['Tables']['companies']['Row']

// 상태 라벨 및 색상
const STATUS_STYLES: Record<
  string,
  { label: string; color: string }
> = {
  draft: { label: '작성중', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: '배정대기', color: 'bg-yellow-100 text-yellow-700' },
  matching: { label: '매칭중', color: 'bg-blue-100 text-blue-700' },
  matched: { label: '매칭완료', color: 'bg-purple-100 text-purple-700' },
  assigned: { label: '배정완료', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-700' },
}

// 라벨 맵핑
const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
}

const CATEGORY_LABELS: Record<string, string> = {
  one_room: '원룸',
  two_room: '투룸',
  three_room_plus: '쓰리룸+',
  officetel: '오피스텔',
  apartment: '아파트',
  villa_house: '빌라/주택',
  office: '사무실',
}

const TIME_SLOT_LABELS: Record<string, string> = {
  morning: '오전 (9-12시)',
  afternoon: '오후 (12-18시)',
  evening: '저녁 (18시 이후)',
  flexible: '시간 협의',
}

const ELEVATOR_LABELS: Record<string, string> = {
  yes: '있음',
  no: '없음',
  unknown: '모름',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EstimateDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 견적 조회
  const { data: estimateData } = await supabase
    .from('estimates')
    .select('*')
    .eq('id', id)
    .single()

  if (!estimateData) {
    notFound()
  }

  const estimate = estimateData as Estimate
  const schema = estimate.schema_data as unknown as MovingSchema

  // 배정된 업체 정보 조회
  const { data: matchingData } = await supabase
    .from('matchings')
    .select('*, company:companies(*)')
    .eq('estimate_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const matching = matchingData as MatchingWithCompany | null

  const status = STATUS_STYLES[estimate.status] || {
    label: estimate.status,
    color: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/estimates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">견적 상세</h1>
            <p className="text-sm text-muted-foreground">
              ID: {estimate.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 고객 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              고객 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">이름</span>
              <span className="font-medium">{schema.contact?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">연락처</span>
              <span className="font-medium">{schema.contact?.phone || estimate.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">통신사</span>
              <span>{schema.contact?.carrier || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">희망 연락시간</span>
              <span>{schema.contact?.preferredTime || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* 이사 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" />
              이사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주거 형태</span>
              <span className="font-medium">
                {schema.move?.category ? CATEGORY_LABELS[schema.move.category] || schema.move.category : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이사 형태</span>
              <span className="font-medium">
                {schema.move?.type ? MOVE_TYPE_LABELS[schema.move.type] || schema.move.type : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이사 예정일</span>
              <span className="font-medium">{schema.move?.schedule?.date || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">희망 시간대</span>
              <span>
                {schema.move?.timeSlot ? TIME_SLOT_LABELS[schema.move.timeSlot] || schema.move.timeSlot : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 출발지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              출발지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">주소</span>
              <p className="font-medium">{schema.departure?.address || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">층수</span>
                <p>{schema.departure?.floor || '-'}층</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">엘리베이터</span>
                <p>
                  {schema.departure?.hasElevator
                    ? ELEVATOR_LABELS[schema.departure.hasElevator] || schema.departure.hasElevator
                    : '-'}
                </p>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">평수</span>
              <p>{schema.departure?.squareFootage || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 도착지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              도착지
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">주소</span>
              <p className="font-medium">{schema.arrival?.address || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-sm">층수</span>
                <p>{schema.arrival?.floor || '-'}층</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">엘리베이터</span>
                <p>
                  {schema.arrival?.hasElevator
                    ? ELEVATOR_LABELS[schema.arrival.hasElevator] || schema.arrival.hasElevator
                    : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 부가서비스 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-4 h-4" />
            부가서비스
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {schema.services?.ladderTruck && (
              <Badge variant="outline">사다리차</Badge>
            )}
            {schema.services?.airconInstall?.needed && (
              <Badge variant="outline">
                에어컨 설치 ({schema.services.airconInstall.qty || 1}대)
              </Badge>
            )}
            {schema.services?.cleaning && (
              <Badge variant="outline">청소</Badge>
            )}
            {schema.services?.organizing && (
              <Badge variant="outline">정리정돈</Badge>
            )}
            {schema.services?.storage?.needed && (
              <Badge variant="outline">보관</Badge>
            )}
            {schema.services?.disposal && (
              <Badge variant="outline">폐기물 처리</Badge>
            )}
            {!schema.services?.ladderTruck &&
              !schema.services?.airconInstall?.needed &&
              !schema.services?.cleaning &&
              !schema.services?.organizing &&
              !schema.services?.storage?.needed &&
              !schema.services?.disposal && (
                <span className="text-muted-foreground">없음</span>
              )}
          </div>
        </CardContent>
      </Card>

      {/* 요청사항 */}
      {schema.conditions?.extraRequests && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">요청사항</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{schema.conditions.extraRequests}</p>
          </CardContent>
        </Card>
      )}

      {/* 배정 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            배정 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matching ? (
            <AssignmentStatusWrapper
              matching={matching}
              estimateId={id}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">배정된 업체가 없습니다.</p>
              {estimate.status === 'submitted' && (
                <Link href={`/admin/estimates/${id}/assign`}>
                  <Button>업체 배정하기</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 메타 정보 */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>생성일: {new Date(estimate.created_at).toLocaleString('ko-KR')}</p>
        <p>수정일: {new Date(estimate.updated_at).toLocaleString('ko-KR')}</p>
        <p>완성도: {Math.round((estimate.completion_rate || 0) * 100)}%</p>
      </div>
    </div>
  )
}
