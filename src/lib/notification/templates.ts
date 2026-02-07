/**
 * SMS 알림 템플릿
 *
 * 이사매칭 서비스에서 사용하는 SMS 알림 메시지 템플릿
 */

export interface NotificationData {
  customerName?: string
  customerPhone?: string
  companyName?: string
  moveDate?: string
  moveType?: string
  departureAddress?: string
  arrivalAddress?: string
  estimateId?: string
  resultUrl?: string
}

// 이사 형태 라벨
const MOVE_TYPE_LABELS: Record<string, string> = {
  truck: '용달이사',
  general: '일반이사',
  half_pack: '반포장이사',
  full_pack: '포장이사',
  storage: '보관이사',
}

/**
 * 고객에게 발송: 업체 배정 완료 알림
 */
export function customerAssignmentNotification(data: NotificationData): string {
  const moveType = data.moveType ? MOVE_TYPE_LABELS[data.moveType] || data.moveType : '이사'

  return `[이사매칭] 업체 배정 완료

${data.customerName || '고객'}님,
${moveType} 견적에 업체가 배정되었습니다.

배정업체: ${data.companyName || '-'}
이사일: ${data.moveDate || '-'}

곧 업체에서 연락드릴 예정입니다.
문의: 1588-0000`
}

/**
 * 업체에게 발송: 새 견적 배정 알림
 */
export function companyAssignmentNotification(data: NotificationData): string {
  const moveType = data.moveType ? MOVE_TYPE_LABELS[data.moveType] || data.moveType : '이사'

  return `[이사매칭] 새 견적 배정

${data.companyName || '업체'}님,
새로운 ${moveType} 견적이 배정되었습니다.

고객: ${data.customerName || '-'}
연락처: ${data.customerPhone || '-'}
이사일: ${data.moveDate || '-'}
출발지: ${data.departureAddress || '-'}
도착지: ${data.arrivalAddress || '-'}

빠른 시일 내에 고객에게 연락 부탁드립니다.`
}

/**
 * 고객에게 발송: 이사 완료 알림
 */
export function customerCompletionNotification(data: NotificationData): string {
  return `[이사매칭] 이사 완료

${data.customerName || '고객'}님,
이사가 완료 처리되었습니다.

업체: ${data.companyName || '-'}

서비스는 만족스러우셨나요?
리뷰를 남겨주시면 다른 고객에게 도움이 됩니다.

리뷰 작성: ${data.resultUrl || '이사매칭 홈페이지'}`
}

/**
 * 고객에게 발송: 배정 취소 알림
 */
export function customerCancellationNotification(data: NotificationData): string {
  return `[이사매칭] 배정 취소 안내

${data.customerName || '고객'}님,
죄송합니다. 배정된 업체가 취소되었습니다.

새로운 업체 배정을 위해 최선을 다하겠습니다.
곧 연락드리겠습니다.

문의: 1588-0000`
}

/**
 * 업체에게 발송: 배정 취소 알림
 */
export function companyCancellationNotification(data: NotificationData): string {
  return `[이사매칭] 배정 취소 안내

${data.companyName || '업체'}님,
아래 견적의 배정이 취소되었습니다.

고객: ${data.customerName || '-'}
이사일: ${data.moveDate || '-'}

관리자에 의한 취소입니다.
문의: 1588-0000`
}

/**
 * 고객에게 발송: 업체 변경 알림
 */
export function customerCompanyChangeNotification(data: NotificationData): string {
  return `[이사매칭] 업체 변경 안내

${data.customerName || '고객'}님,
배정 업체가 변경되었습니다.

새 업체: ${data.companyName || '-'}
이사일: ${data.moveDate || '-'}

곧 새 업체에서 연락드릴 예정입니다.
문의: 1588-0000`
}

/**
 * 알림 템플릿 타입
 */
export type NotificationType =
  | 'customer_assignment'
  | 'company_assignment'
  | 'customer_completion'
  | 'customer_cancellation'
  | 'company_cancellation'
  | 'customer_company_change'

/**
 * 템플릿 타입에 따라 메시지 생성
 */
export function getNotificationMessage(
  type: NotificationType,
  data: NotificationData
): string {
  switch (type) {
    case 'customer_assignment':
      return customerAssignmentNotification(data)
    case 'company_assignment':
      return companyAssignmentNotification(data)
    case 'customer_completion':
      return customerCompletionNotification(data)
    case 'customer_cancellation':
      return customerCancellationNotification(data)
    case 'company_cancellation':
      return companyCancellationNotification(data)
    case 'customer_company_change':
      return customerCompanyChangeNotification(data)
    default:
      throw new Error(`Unknown notification type: ${type}`)
  }
}
