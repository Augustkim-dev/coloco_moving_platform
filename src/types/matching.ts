import type { Database } from './database'

export type Matching = Database['public']['Tables']['matchings']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Estimate = Database['public']['Tables']['estimates']['Row']

// 배정 상태
export type MatchingStatus = 'pending' | 'accepted' | 'rejected' | 'timeout' | 'completed'

// 매칭 상태 라벨
export const MATCHING_STATUS_LABELS: Record<MatchingStatus, string> = {
  pending: '대기중',
  accepted: '배정완료',
  rejected: '거절됨',
  timeout: '시간초과',
  completed: '완료',
}

// 매칭 상태 스타일
export const MATCHING_STATUS_STYLES: Record<MatchingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  timeout: 'bg-gray-100 text-gray-700',
  completed: 'bg-blue-100 text-blue-700',
}

// 확장된 매칭 정보 (업체 정보 포함)
export interface MatchingWithCompany extends Matching {
  company: Company
}

// 배정 요청 타입
export interface AssignRequest {
  estimateId: string
  companyId: string
  adminMemo?: string | null
}

// 배정 응답 타입
export interface AssignResponse {
  success: boolean
  matching?: Matching
  message: string
  error?: string
}

// 상태 변경 요청 타입
export interface UpdateMatchingStatusRequest {
  matchingId: string
  status: MatchingStatus
  adminMemo?: string | null
}

// 업체 변경 요청 타입
export interface ChangeCompanyRequest {
  matchingId: string
  newCompanyId: string
  reason?: string
}
