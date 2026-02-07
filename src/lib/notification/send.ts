/**
 * SMS 알림 발송 유틸리티
 *
 * Solapi SMS API를 통해 알림 발송
 */

import { getNotificationMessage, type NotificationType, type NotificationData } from './templates'

// Re-export types for external use
export type { NotificationType, NotificationData } from './templates'

export interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * 전화번호 정규화 (하이픈 제거)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

/**
 * 전화번호 유효성 검사
 */
function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^01[016789]\d{7,8}$/.test(normalized)
}

/**
 * SMS 발송 (Solapi API)
 */
export async function sendSms(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const cleanPhone = normalizePhone(phone)

  if (!isValidPhone(cleanPhone)) {
    return {
      success: false,
      error: '유효하지 않은 전화번호입니다.',
    }
  }

  const apiKey = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET
  const sender = process.env.SOLAPI_SENDER

  // 개발 환경: 콘솔에 출력
  if (!apiKey || !apiSecret || !sender) {
    console.log(`[DEV SMS] To: ${cleanPhone}`)
    console.log(`[DEV SMS] Message:\n${message}`)
    console.log('---')
    return {
      success: true,
      messageId: `dev-${Date.now()}`,
    }
  }

  // 실제 SMS 발송
  try {
    const timestamp = new Date().toISOString()
    const salt = Math.random().toString(36).substring(2, 15)

    // LMS 사용 (길이가 긴 메시지)
    const messageType = message.length > 80 ? 'LMS' : 'SMS'

    const response = await fetch(
      'https://api.solapi.com/messages/v4/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${apiSecret}`,
        },
        body: JSON.stringify({
          message: {
            to: cleanPhone,
            from: sender,
            text: message,
            type: messageType,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SMS send failed:', errorText)
      return {
        success: false,
        error: `SMS 발송 실패: ${response.status}`,
      }
    }

    const result = await response.json()

    return {
      success: true,
      messageId: result.messageId || result.groupId,
    }
  } catch (error) {
    console.error('SMS API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS 발송 중 오류 발생',
    }
  }
}

/**
 * 알림 타입별 SMS 발송
 */
export async function sendNotification(
  phone: string,
  type: NotificationType,
  data: NotificationData
): Promise<SendSmsResult> {
  const message = getNotificationMessage(type, data)
  return sendSms(phone, message)
}

/**
 * 배정 알림 발송 (고객 + 업체)
 */
export async function sendAssignmentNotifications(params: {
  customerPhone: string
  customerName?: string
  companyPhone?: string
  companyName: string
  moveDate?: string
  moveType?: string
  departureAddress?: string
  arrivalAddress?: string
  resultUrl?: string
}): Promise<{
  customerResult: SendSmsResult
  companyResult: SendSmsResult | null
}> {
  const data: NotificationData = {
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    companyName: params.companyName,
    moveDate: params.moveDate,
    moveType: params.moveType,
    departureAddress: params.departureAddress,
    arrivalAddress: params.arrivalAddress,
    resultUrl: params.resultUrl,
  }

  // 고객에게 발송
  const customerResult = await sendNotification(
    params.customerPhone,
    'customer_assignment',
    data
  )

  // 업체에게 발송 (전화번호가 있는 경우)
  let companyResult: SendSmsResult | null = null
  if (params.companyPhone) {
    companyResult = await sendNotification(
      params.companyPhone,
      'company_assignment',
      data
    )
  }

  return { customerResult, companyResult }
}

/**
 * 완료 알림 발송
 */
export async function sendCompletionNotification(params: {
  customerPhone: string
  customerName?: string
  companyName: string
  resultUrl?: string
}): Promise<SendSmsResult> {
  return sendNotification(params.customerPhone, 'customer_completion', {
    customerName: params.customerName,
    companyName: params.companyName,
    resultUrl: params.resultUrl,
  })
}

/**
 * 취소 알림 발송
 */
export async function sendCancellationNotifications(params: {
  customerPhone: string
  customerName?: string
  companyPhone?: string
  companyName: string
  moveDate?: string
}): Promise<{
  customerResult: SendSmsResult
  companyResult: SendSmsResult | null
}> {
  const data: NotificationData = {
    customerName: params.customerName,
    companyName: params.companyName,
    moveDate: params.moveDate,
  }

  // 고객에게 발송
  const customerResult = await sendNotification(
    params.customerPhone,
    'customer_cancellation',
    data
  )

  // 업체에게 발송
  let companyResult: SendSmsResult | null = null
  if (params.companyPhone) {
    companyResult = await sendNotification(
      params.companyPhone,
      'company_cancellation',
      data
    )
  }

  return { customerResult, companyResult }
}
