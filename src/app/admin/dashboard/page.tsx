import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, Truck, CheckCircle, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Estimate = Database['public']['Tables']['estimates']['Row']

// 통계 카드 타입
interface StatCard {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 오늘 날짜 (한국 시간 기준)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // 견적 통계 조회 - 각각 개별 조회
  const { count: newCount } = await supabase
    .from('estimates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)

  const { count: pendingCount } = await supabase
    .from('estimates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted')

  const { count: inProgressCount } = await supabase
    .from('estimates')
    .select('*', { count: 'exact', head: true })
    .in('status', ['matching', 'matched', 'assigned'])

  const { count: completedCount } = await supabase
    .from('estimates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { data: recentEstimatesData } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const recentEstimates: Estimate[] = recentEstimatesData || []

  const { count: totalCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })

  const { count: activeCompanies } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const stats: StatCard[] = [
    {
      label: '오늘 신규',
      value: newCount || 0,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: '배정 대기',
      value: pendingCount || 0,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: '진행중',
      value: inProgressCount || 0,
      icon: <Truck className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: '완료',
      value: completedCount || 0,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
    },
  ]

  // 상태 라벨 맵핑
  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: '작성중', color: 'bg-gray-100 text-gray-700' },
    submitted: { label: '배정대기', color: 'bg-yellow-100 text-yellow-700' },
    matching: { label: '매칭중', color: 'bg-blue-100 text-blue-700' },
    matched: { label: '매칭완료', color: 'bg-purple-100 text-purple-700' },
    assigned: { label: '배정완료', color: 'bg-indigo-100 text-indigo-700' },
    completed: { label: '완료', color: 'bg-green-100 text-green-700' },
    cancelled: { label: '취소', color: 'bg-red-100 text-red-700' },
  }

  // 이사 형태 라벨
  const moveTypeLabels: Record<string, string> = {
    truck: '용달이사',
    general: '일반이사',
    half_pack: '반포장이사',
    full_pack: '포장이사',
    storage: '보관이사',
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 최근 견적 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">최근 견적 요청</CardTitle>
            <Link
              href="/admin/estimates"
              className="text-sm text-primary hover:underline"
            >
              전체 보기 →
            </Link>
          </CardHeader>
          <CardContent>
            {recentEstimates && recentEstimates.length > 0 ? (
              <div className="space-y-3">
                {recentEstimates.map((estimate) => {
                  const schemaData = estimate.schema_data as {
                    contact?: { name?: string }
                    move?: { type?: string; schedule?: { date?: string } }
                    departure?: { address?: { full?: string } }
                    arrival?: { address?: { full?: string } }
                  }
                  const status = statusLabels[estimate.status] || {
                    label: estimate.status,
                    color: 'bg-gray-100 text-gray-700',
                  }
                  const moveType = schemaData?.move?.type
                    ? moveTypeLabels[schemaData.move.type] || schemaData.move.type
                    : '-'

                  return (
                    <Link
                      key={estimate.id}
                      href={`/admin/estimates/${estimate.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {schemaData?.contact?.name || '이름 없음'}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {moveType} | {schemaData?.move?.schedule?.date || '날짜 미정'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(estimate.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                견적 요청이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 업체 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              업체 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">전체 업체</span>
                <span className="font-semibold">{totalCompanies || 0}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">활성 업체</span>
                <span className="font-semibold text-green-600">
                  {activeCompanies || 0}개
                </span>
              </div>
              <div className="pt-4 border-t">
                <Link
                  href="/admin/companies"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <TrendingUp className="w-4 h-4" />
                  업체 관리로 이동 →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
