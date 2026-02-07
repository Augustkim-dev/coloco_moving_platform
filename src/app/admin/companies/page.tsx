import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Plus, ChevronRight, Star } from 'lucide-react'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

interface PageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

const PAGE_SIZE = 20

const STATUS_STYLES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '승인대기', variant: 'secondary' },
  active: { label: '활성', variant: 'default' },
  suspended: { label: '정지', variant: 'destructive' },
}

const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달',
  general: '일반',
  half_pack: '반포장',
  full_pack: '포장',
  storage: '보관',
}

export default async function AdminCompaniesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const offset = (page - 1) * PAGE_SIZE

  // 쿼리 빌드
  let query = supabase.from('companies').select('*', { count: 'exact' })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const { data: companiesData, count } = await query

  const companies: Company[] = companiesData || []
  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            업체 관리
          </CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              총 {totalCount}개
            </span>
            <Link href="/admin/companies/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                업체 등록
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 상태 필터 */}
          <div className="flex gap-2">
            <Link href="/admin/companies">
              <Button
                variant={status === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                전체
              </Button>
            </Link>
            <Link href="/admin/companies?status=active">
              <Button
                variant={status === 'active' ? 'default' : 'outline'}
                size="sm"
              >
                활성
              </Button>
            </Link>
            <Link href="/admin/companies?status=pending">
              <Button
                variant={status === 'pending' ? 'default' : 'outline'}
                size="sm"
              >
                승인대기
              </Button>
            </Link>
            <Link href="/admin/companies?status=suspended">
              <Button
                variant={status === 'suspended' ? 'default' : 'outline'}
                size="sm"
              >
                정지
              </Button>
            </Link>
          </div>

          {/* 업체 목록 */}
          {companies.length > 0 ? (
            <div className="space-y-3">
              {companies.map((company) => {
                const statusStyle = STATUS_STYLES[company.status] || {
                  label: company.status,
                  variant: 'secondary' as const,
                }
                const moveTypes = company.move_types
                  .map((t) => MOVE_TYPE_LABELS[t] || t)
                  .join(', ')
                const regions = company.service_regions.slice(0, 3).join(', ')
                const moreRegions = company.service_regions.length > 3
                  ? ` 외 ${company.service_regions.length - 3}개`
                  : ''

                return (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="block p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {company.business_name}
                          </span>
                          <Badge variant={statusStyle.variant}>
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <p>{moveTypes || '이사 형태 미설정'}</p>
                          <p className="truncate">
                            {regions}{moreRegions}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            {company.avg_rating.toFixed(1)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            리뷰 {company.review_count}개
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              등록된 업체가 없습니다.
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {page > 1 && (
                <a
                  href={`/admin/companies?status=${status}&page=${page - 1}`}
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
                  href={`/admin/companies?status=${status}&page=${page + 1}`}
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
