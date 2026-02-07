'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'
import type { Database } from '@/types/database'

type Estimate = Database['public']['Tables']['estimates']['Row']

// 상태 라벨 및 색상
const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '작성중', variant: 'secondary' },
  submitted: { label: '배정대기', variant: 'default' },
  matching: { label: '매칭중', variant: 'default' },
  matched: { label: '매칭완료', variant: 'default' },
  assigned: { label: '배정완료', variant: 'outline' },
  completed: { label: '완료', variant: 'secondary' },
  cancelled: { label: '취소', variant: 'destructive' },
}

// 이사 형태 라벨
const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
}

// 주거 형태 라벨
const CATEGORY_LABELS: Record<string, string> = {
  one_room: '원룸',
  two_room: '투룸',
  three_room_plus: '쓰리룸+',
  officetel: '오피스텔',
  apartment: '아파트',
  villa_house: '빌라/주택',
  office: '사무실',
}

interface EstimateTableProps {
  estimates: Estimate[]
}

export function EstimateTable({ estimates }: EstimateTableProps) {
  if (estimates.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        견적 요청이 없습니다.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">고객</th>
            <th className="pb-3 font-medium hidden sm:table-cell">이사형태</th>
            <th className="pb-3 font-medium hidden md:table-cell">이사일</th>
            <th className="pb-3 font-medium hidden lg:table-cell">지역</th>
            <th className="pb-3 font-medium">상태</th>
            <th className="pb-3 font-medium text-right">신청일</th>
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          {estimates.map((estimate) => {
            const schemaData = estimate.schema_data as {
              contact?: { name?: string; phone?: string }
              move?: { type?: string; category?: string; schedule?: { date?: string } }
              departure?: { address?: { full?: string; city?: string; district?: string } }
              arrival?: { address?: { full?: string; city?: string; district?: string } }
            }

            const status = STATUS_STYLES[estimate.status] || {
              label: estimate.status,
              variant: 'secondary' as const,
            }

            const moveType = schemaData?.move?.type
              ? MOVE_TYPE_LABELS[schemaData.move.type] || schemaData.move.type
              : '-'

            const category = schemaData?.move?.category
              ? CATEGORY_LABELS[schemaData.move.category] || schemaData.move.category
              : ''

            const customerName = schemaData?.contact?.name || '이름없음'
            const customerPhone = schemaData?.contact?.phone
              ? schemaData.contact.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3')
              : estimate.phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3') || '-'

            const moveDate = schemaData?.move?.schedule?.date || '-'

            const departureRegion = schemaData?.departure?.address?.district ||
              schemaData?.departure?.address?.city || '-'
            const arrivalRegion = schemaData?.arrival?.address?.district ||
              schemaData?.arrival?.address?.city || '-'

            return (
              <tr
                key={estimate.id}
                className="border-b last:border-0 hover:bg-accent/50 transition-colors"
              >
                <td className="py-3">
                  <div>
                    <span className="font-medium">{customerName}</span>
                    {category && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({category})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {customerPhone}
                  </div>
                </td>
                <td className="py-3 hidden sm:table-cell">
                  <span className="text-sm">{moveType}</span>
                </td>
                <td className="py-3 hidden md:table-cell">
                  <span className="text-sm">{moveDate}</span>
                </td>
                <td className="py-3 hidden lg:table-cell">
                  <span className="text-sm">
                    {departureRegion} → {arrivalRegion}
                  </span>
                </td>
                <td className="py-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="py-3 text-right text-sm text-muted-foreground">
                  {new Date(estimate.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="py-3 pl-2">
                  <Link
                    href={`/admin/estimates/${estimate.id}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
