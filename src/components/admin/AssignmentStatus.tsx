'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Check, X, Clock, Phone, Calendar, Building2, MessageSquare } from 'lucide-react'
import {
  MATCHING_STATUS_LABELS,
  MATCHING_STATUS_STYLES,
  type MatchingStatus,
  type MatchingWithCompany,
} from '@/types/matching'

interface AssignmentStatusProps {
  matching: MatchingWithCompany
  estimateId: string
  onStatusChange?: () => void
}

export function AssignmentStatus({
  matching,
  estimateId,
  onStatusChange,
}: AssignmentStatusProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'complete' | 'cancel' | null>(null)

  const status = matching.status as MatchingStatus

  const handleStatusChange = async (newStatus: MatchingStatus) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/assign/${matching.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '상태 변경에 실패했습니다.')
      }

      setShowConfirmDialog(false)
      setConfirmAction(null)
      router.refresh()
      onStatusChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/assign/${matching.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '배정 취소에 실패했습니다.')
      }

      setShowConfirmDialog(false)
      setConfirmAction(null)
      router.refresh()
      onStatusChange?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const openConfirmDialog = (action: 'complete' | 'cancel') => {
    setConfirmAction(action)
    setShowConfirmDialog(true)
  }

  return (
    <div className="space-y-4">
      {/* 배정 업체 정보 */}
      <div className="p-4 bg-accent/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{matching.company?.business_name}</span>
          </div>
          <Badge className={MATCHING_STATUS_STYLES[status]}>
            {MATCHING_STATUS_LABELS[status]}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            <span>업체 연락처</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>
              배정일: {new Date(matching.created_at).toLocaleString('ko-KR')}
            </span>
          </div>
          {matching.responded_at && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>
                응답일: {new Date(matching.responded_at).toLocaleString('ko-KR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 관리자 메모 */}
      {matching.admin_memo && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
            <MessageSquare className="w-4 h-4" />
            관리자 메모
          </div>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">
            {matching.admin_memo}
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* 액션 버튼 */}
      {status === 'accepted' && (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => openConfirmDialog('complete')}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-1" />
            완료 처리
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/estimates/${estimateId}/assign`)}
            disabled={isLoading}
          >
            업체 변경
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openConfirmDialog('cancel')}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-1" />
            배정 취소
          </Button>
        </div>
      )}

      {status === 'completed' && (
        <div className="text-sm text-green-600 flex items-center gap-1">
          <Check className="w-4 h-4" />
          이사가 완료되었습니다.
        </div>
      )}

      {(status === 'rejected' || status === 'timeout') && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            배정이 취소되었습니다. 다시 배정할 수 있습니다.
          </div>
          <Button
            size="sm"
            onClick={() => router.push(`/admin/estimates/${estimateId}/assign`)}
          >
            다시 배정하기
          </Button>
        </div>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'complete' ? '완료 처리' : '배정 취소'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'complete'
                ? '이 견적을 완료 처리하시겠습니까? 이사가 성공적으로 완료된 경우에만 완료 처리해 주세요.'
                : '이 배정을 취소하시겠습니까? 취소 후 다른 업체에 재배정할 수 있습니다.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              variant={confirmAction === 'cancel' ? 'destructive' : 'default'}
              onClick={() =>
                confirmAction === 'complete'
                  ? handleStatusChange('completed')
                  : handleCancel()
              }
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : confirmAction === 'complete' ? (
                '완료 처리'
              ) : (
                '배정 취소'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
