'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Search,
  Loader2,
  ArrowRight,
  Calendar,
  Truck,
  Phone,
} from 'lucide-react'
import type { Database } from '@/types/database'
import type { MovingSchema } from '@/types/schema'

type Estimate = Database['public']['Tables']['estimates']['Row']

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '작성중', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: '배정대기', color: 'bg-yellow-100 text-yellow-700' },
  matching: { label: '매칭중', color: 'bg-blue-100 text-blue-700' },
  matched: { label: '배정완료', color: 'bg-green-100 text-green-700' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-700' },
}

const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
}

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()

  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 전화번호로 견적 검색
  const handleSearch = async () => {
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요.')
      return
    }

    const cleanPhone = phone.replace(/[^\d]/g, '')
    if (cleanPhone.length < 10) {
      setError('올바른 전화번호를 입력해주세요.')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const { data, error: searchError } = await supabase
        .from('estimates')
        .select('*')
        .eq('phone', cleanPhone)
        .order('created_at', { ascending: false })

      if (searchError) {
        throw new Error('검색 중 오류가 발생했습니다.')
      }

      setEstimates((data || []) as Estimate[])
      setHasSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '검색에 실패했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 헤더 */}
        <div className="pt-4">
          <h1 className="text-xl font-semibold">내 견적 조회</h1>
          <p className="text-sm text-muted-foreground mt-1">
            전화번호로 신청하신 견적을 확인하세요
          </p>
        </div>

        {/* 검색 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4" />
              전화번호로 조회
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* 검색 결과 */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              검색 결과
              <Badge variant="outline">{estimates.length}건</Badge>
            </h2>

            {estimates.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>해당 전화번호로 신청된 견적이 없습니다.</p>
                  <Link href="/estimate" className="mt-4 inline-block">
                    <Button>견적 신청하기</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {estimates.map((estimate) => {
                  const schema = estimate.schema_data as unknown as MovingSchema
                  const status = STATUS_LABELS[estimate.status] || {
                    label: estimate.status,
                    color: 'bg-gray-100 text-gray-700',
                  }

                  return (
                    <Link
                      key={estimate.id}
                      href={`/estimate/result/${estimate.id}`}
                    >
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {estimate.id.slice(0, 8)}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {schema?.move?.type
                                    ? MOVE_TYPE_LABELS[schema.move.type] || schema.move.type
                                    : '-'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {schema?.move?.schedule?.date || '-'}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground truncate">
                                {schema?.departure?.address || '출발지 미입력'}
                                {' → '}
                                {schema?.arrival?.address || '도착지 미입력'}
                              </p>
                            </div>

                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            신청일: {new Date(estimate.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* 새 견적 신청 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                새로운 이사 견적이 필요하신가요?
              </p>
              <Link href="/estimate">
                <Button>새 견적 신청하기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
