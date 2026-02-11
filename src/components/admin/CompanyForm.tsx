'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

const MOVE_TYPES = [
  { value: 'truck', label: '용달이사' },
  { value: 'general', label: '일반이사' },
  { value: 'half_pack', label: '반포장이사' },
  { value: 'full_pack', label: '포장이사' },
  { value: 'storage', label: '보관이사' },
]

const REGIONS = [
  '서울 전체',
  '서울 강남권',
  '서울 강북권',
  '서울 강서권',
  '서울 강동권',
  '경기 남부',
  '경기 북부',
  '인천',
  '수도권 전체',
]

const STATUS_OPTIONS: { value: 'pending' | 'active' | 'suspended'; label: string }[] = [
  { value: 'pending', label: '승인대기' },
  { value: 'active', label: '활성' },
  { value: 'suspended', label: '정지' },
]

interface CompanyFormProps {
  company?: Company
  isEdit?: boolean
}

export function CompanyForm({ company, isEdit = false }: CompanyFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 폼 상태
  const [businessName, setBusinessName] = useState(company?.business_name || '')
  const [businessNumber, setBusinessNumber] = useState(company?.business_number || '')
  const [phone, setPhone] = useState('')
  const [moveTypes, setMoveTypes] = useState<string[]>(company?.move_types || [])
  const [serviceRegions, setServiceRegions] = useState<string[]>(
    company?.service_regions || []
  )
  const [status, setStatus] = useState(company?.status || 'pending')

  const toggleMoveType = (type: string) => {
    setMoveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleRegion = (region: string) => {
    setServiceRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!businessName.trim()) {
        throw new Error('업체명을 입력해주세요.')
      }

      if (moveTypes.length === 0) {
        throw new Error('이사 형태를 1개 이상 선택해주세요.')
      }

      if (serviceRegions.length === 0) {
        throw new Error('서비스 지역을 1개 이상 선택해주세요.')
      }

      // 현재 로그인한 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('로그인이 필요합니다.')
      }

      if (isEdit && company) {
        // 수정
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('companies')
          .update({
            business_name: businessName.trim(),
            business_number: businessNumber.trim() || null,
            move_types: moveTypes,
            service_regions: serviceRegions,
            status: status,
          })
          .eq('id', company.id)

        if (updateError) throw updateError
      } else {
        // 신규 등록 - user_id는 현재 로그인한 admin의 ID 사용
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('companies')
          .insert({
            business_name: businessName.trim(),
            business_number: businessNumber.trim() || null,
            move_types: moveTypes,
            service_regions: serviceRegions,
            status: status,
            user_id: user.id,
            vehicles: [],
          })

        if (insertError) throw insertError
      }

      router.push('/admin/companies')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">업체명 *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="이사업체명"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessNumber">사업자등록번호</Label>
              <Input
                id="businessNumber"
                value={businessNumber}
                onChange={(e) => setBusinessNumber(e.target.value)}
                placeholder="000-00-00000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
          </div>
        </CardContent>
      </Card>

      {/* 이사 형태 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">이사 형태 *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {MOVE_TYPES.map((type) => (
              <Button
                key={type.value}
                type="button"
                variant={moveTypes.includes(type.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleMoveType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 서비스 지역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">서비스 지역 *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((region) => (
              <Button
                key={region}
                type="button"
                variant={serviceRegions.includes(region) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleRegion(region)}
              >
                {region}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 상태 (수정 시에만) */}
      {isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={status === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : isEdit ? (
            '수정하기'
          ) : (
            '등록하기'
          )}
        </Button>
      </div>
    </form>
  )
}
