'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Building2,
  Search,
  Star,
  MapPin,
  Truck,
  Loader2,
  Check,
} from 'lucide-react'
import type { Database } from '@/types/database'
import type { MovingSchema } from '@/types/schema'

type Company = Database['public']['Tables']['companies']['Row']
type Estimate = Database['public']['Tables']['estimates']['Row']

const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
}

export default function AssignCompanyPage() {
  const router = useRouter()
  const params = useParams()
  const estimateId = params.id as string
  const supabase = createClient()

  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [adminMemo, setAdminMemo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 견적 및 업체 목록 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 견적 정보 로드
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', estimateId)
          .single()

        if (estimateError || !estimateData) {
          throw new Error('견적 정보를 찾을 수 없습니다.')
        }

        setEstimate(estimateData as Estimate)

        // 활성 상태 업체 목록 로드
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('status', 'active')
          .order('avg_rating', { ascending: false })

        if (companiesError) {
          throw new Error('업체 목록을 불러올 수 없습니다.')
        }

        const allCompanies = (companiesData || []) as Company[]
        setCompanies(allCompanies)
        setFilteredCompanies(allCompanies)
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [estimateId, supabase])

  // 검색 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = companies.filter(
      (company) =>
        company.business_name.toLowerCase().includes(term) ||
        company.service_regions?.some((region) =>
          region.toLowerCase().includes(term)
        ) ||
        company.move_types?.some(
          (type) =>
            MOVE_TYPE_LABELS[type]?.toLowerCase().includes(term) ||
            type.toLowerCase().includes(term)
        )
    )
    setFilteredCompanies(filtered)
  }, [searchTerm, companies])

  // 업체 배정 처리
  const handleAssign = async () => {
    if (!selectedCompany || !estimate) return

    setIsAssigning(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateId: estimate.id,
          companyId: selectedCompany.id,
          adminMemo: adminMemo.trim() || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '배정에 실패했습니다.')
      }

      router.push(`/admin/estimates/${estimateId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '배정에 실패했습니다.')
    } finally {
      setIsAssigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !estimate) {
    return (
      <div className="space-y-4">
        <div className="text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          {error}
        </div>
        <Link href="/admin/estimates">
          <Button variant="outline">목록으로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  const schema = estimate?.schema_data as unknown as MovingSchema

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/estimates/${estimateId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">업체 배정</h1>
          <p className="text-sm text-muted-foreground">
            견적에 적합한 이사업체를 선택하세요
          </p>
        </div>
      </div>

      {/* 견적 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">고객</span>
              <p className="font-medium">{schema?.contact?.name || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">이사 형태</span>
              <p className="font-medium">
                {schema?.move?.type
                  ? MOVE_TYPE_LABELS[schema.move.type] || schema.move.type
                  : '-'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">이사 예정일</span>
              <p className="font-medium">{schema?.move?.schedule?.date || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">출발지</span>
              <p className="font-medium truncate">
                {schema?.departure?.address || '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 업체 목록 */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                업체 선택
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="업체명, 지역, 이사형태로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 업체 리스트 */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCompanies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다.
                  </p>
                ) : (
                  filteredCompanies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => setSelectedCompany(company)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCompany?.id === company.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {company.business_name}
                            </span>
                            {selectedCompany?.id === company.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span>
                              {company.avg_rating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="mx-1">·</span>
                            <span>리뷰 {company.review_count || 0}건</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {company.move_types?.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            {MOVE_TYPE_LABELS[type] || type}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {company.service_regions?.slice(0, 3).map((region) => (
                          <Badge
                            key={region}
                            variant="outline"
                            className="text-xs"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {region}
                          </Badge>
                        ))}
                        {(company.service_regions?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.service_regions!.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 배정 정보 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">배정 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCompany ? (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <p className="font-medium">{selectedCompany.business_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>
                      {selectedCompany.avg_rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="mx-1">·</span>
                    <span>리뷰 {selectedCompany.review_count || 0}건</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  좌측에서 업체를 선택하세요
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="adminMemo">관리자 메모</Label>
                <Textarea
                  id="adminMemo"
                  placeholder="배정 관련 메모 (선택사항)"
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isAssigning}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedCompany || isAssigning}
                  className="flex-1"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      배정 중...
                    </>
                  ) : (
                    '배정하기'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 안내 */}
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                💡 업체 배정 시 고객과 업체에게 SMS 알림이 발송됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
