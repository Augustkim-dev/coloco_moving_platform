import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  MapPin,
  Calendar,
  Truck,
  Phone,
  CheckCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import type { Database } from '@/types/database'
import type { MovingSchema } from '@/types/schema'

type Estimate = Database['public']['Tables']['estimates']['Row']
type Company = Database['public']['Tables']['companies']['Row']
type Matching = Database['public']['Tables']['matchings']['Row']

// 상태 라벨 및 색상
const STATUS_STYLES: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: '작성중', color: 'bg-gray-100 text-gray-700', icon: Clock },
  submitted: { label: '배정대기', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  matching: { label: '매칭중', color: 'bg-blue-100 text-blue-700', icon: Clock },
  matched: { label: '업체배정완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: '이사완료', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: '취소됨', color: 'bg-red-100 text-red-700', icon: Clock },
}

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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EstimateResultPage({ params }: PageProps) {
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
    .in('status', ['accepted', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const matching = matchingData as (Matching & { company: Company }) | null

  const status = STATUS_STYLES[estimate.status] || {
    label: estimate.status,
    color: 'bg-gray-100 text-gray-700',
    icon: Clock,
  }

  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 pt-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">견적 신청 결과</h1>
            <p className="text-sm text-muted-foreground">
              신청번호: {estimate.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* 상태 카드 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <StatusIcon className="w-8 h-8 text-primary" />
              <div>
                <Badge className={`${status.color} text-base px-4 py-1`}>
                  {status.label}
                </Badge>
              </div>
            </div>

            {/* 상태별 메시지 */}
            <div className="text-center mt-4 text-muted-foreground">
              {estimate.status === 'submitted' && (
                <p>견적 신청이 완료되었습니다. 곧 업체를 배정해드리겠습니다.</p>
              )}
              {estimate.status === 'matched' && matching && (
                <p>업체가 배정되었습니다. 곧 업체에서 연락드릴 예정입니다.</p>
              )}
              {estimate.status === 'completed' && (
                <p>이사가 완료되었습니다. 이용해 주셔서 감사합니다!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 배정 업체 정보 */}
        {matching && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                배정된 이사업체
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {matching.company?.business_name}
                  </span>
                  {matching.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      완료
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  배정일: {new Date(matching.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  업체에서 곧 연락드릴 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 견적 정보 요약 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" />
              이사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">이사 형태</span>
                <p className="font-medium">
                  {schema.move?.type
                    ? MOVE_TYPE_LABELS[schema.move.type] || schema.move.type
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">주거 유형</span>
                <p className="font-medium">
                  {schema.move?.category
                    ? CATEGORY_LABELS[schema.move.category] || schema.move.category
                    : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">이사 예정일:</span>
              <span className="font-medium">
                {schema.move?.schedule?.date || '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 출발지/도착지 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              이사 경로
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <span className="text-sm text-muted-foreground">출발지</span>
                  <p className="font-medium">
                    {schema.departure?.address || '-'}
                  </p>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-muted-foreground/30 h-4 ml-1" />
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <span className="text-sm text-muted-foreground">도착지</span>
                  <p className="font-medium">
                    {schema.arrival?.address || '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 문의 안내 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                문의사항이 있으시면 고객센터로 연락해 주세요.
              </p>
              <p className="font-semibold text-lg">1588-0000</p>
            </div>
          </CardContent>
        </Card>

        {/* 메타 정보 */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <p>신청일: {new Date(estimate.created_at).toLocaleString('ko-KR')}</p>
        </div>
      </div>
    </div>
  )
}
