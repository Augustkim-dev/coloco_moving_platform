'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'all', label: '전체 상태' },
  { value: 'draft', label: '작성중' },
  { value: 'submitted', label: '배차대기' },
  { value: 'assigned', label: '배차완료' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
]

const MOVE_TYPE_OPTIONS = [
  { value: 'all', label: '전체 형태' },
  { value: 'truck', label: '용달이사' },
  { value: 'general', label: '일반이사' },
  { value: 'half_pack', label: '반포장이사' },
  { value: 'full_pack', label: '포장이사' },
  { value: 'storage', label: '보관이사' },
]

interface EstimateFiltersProps {
  currentStatus: string
  currentMoveType: string
  currentSearch: string
}

export function EstimateFilters({
  currentStatus,
  currentMoveType,
  currentSearch,
}: EstimateFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [status, setStatus] = useState(currentStatus)
  const [moveType, setMoveType] = useState(currentMoveType)
  const [search, setSearch] = useState(currentSearch)

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }

    if (moveType !== 'all') {
      params.set('moveType', moveType)
    } else {
      params.delete('moveType')
    }

    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    params.delete('page') // 필터 변경 시 첫 페이지로

    startTransition(() => {
      router.push(`/admin/estimates?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    setStatus('all')
    setMoveType('all')
    setSearch('')
    startTransition(() => {
      router.push('/admin/estimates')
    })
  }

  const hasActiveFilters =
    currentStatus !== 'all' || currentMoveType !== 'all' || currentSearch !== ''

  return (
    <div className="flex flex-wrap gap-3">
      {/* 상태 필터 */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* 이사 형태 필터 */}
      <select
        value={moveType}
        onChange={(e) => setMoveType(e.target.value)}
        className="h-9 px-3 rounded-md border border-input bg-background text-sm"
      >
        {MOVE_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* 검색 */}
      <div className="flex gap-2">
        <Input
          placeholder="연락처 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="w-40 md:w-48"
        />
        <Button
          onClick={applyFilters}
          disabled={isPending}
          size="sm"
          className="shrink-0"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* 필터 초기화 */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          disabled={isPending}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          초기화
        </Button>
      )}
    </div>
  )
}
