import { createClient } from '@/lib/supabase/server'
import { EstimateFilters } from '@/components/admin/EstimateFilters'
import { EstimateTable } from '@/components/admin/EstimateTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { Database } from '@/types/database'

type Estimate = Database['public']['Tables']['estimates']['Row']

interface PageProps {
  searchParams: Promise<{
    status?: string
    moveType?: string
    search?: string
    page?: string
  }>
}

const PAGE_SIZE = 20

export default async function AdminEstimatesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const status = params.status || 'all'
  const moveType = params.moveType || 'all'
  const search = params.search || ''
  const page = parseInt(params.page || '1')
  const offset = (page - 1) * PAGE_SIZE

  // 기본 쿼리 빌드
  let query = supabase.from('estimates').select('*', { count: 'exact' })

  // 상태 필터
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // 검색 (이름 또는 전화번호)
  if (search) {
    query = query.or(`phone.ilike.%${search}%`)
  }

  // 정렬 및 페이지네이션
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const { data: estimatesData, count } = await query

  // 타입 캐스팅
  const estimates: Estimate[] = estimatesData || []
  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // 이사 형태로 필터링 (schema_data 내부 필드이므로 클라이언트에서 처리)
  const filteredEstimates =
    moveType !== 'all'
      ? estimates.filter((est) => {
          const schemaData = est.schema_data as { move?: { type?: string } }
          return schemaData?.move?.type === moveType
        })
      : estimates

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            견적 관리
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            총 {totalCount}건
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 */}
          <EstimateFilters
            currentStatus={status}
            currentMoveType={moveType}
            currentSearch={search}
          />

          {/* 테이블 */}
          <EstimateTable estimates={filteredEstimates} />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <a
                  href={`/admin/estimates?status=${status}&moveType=${moveType}&search=${search}&page=${page - 1}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  이전
                </a>
              )}
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={`/admin/estimates?status=${status}&moveType=${moveType}&search=${search}&page=${page + 1}`}
                  className="px-3 py-1 text-sm border rounded hover:bg-accent"
                >
                  다음
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
