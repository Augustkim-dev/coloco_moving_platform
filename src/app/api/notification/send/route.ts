import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification, type NotificationType, type NotificationData } from '@/lib/notification/send'

interface NotificationRequest {
  phone: string
  type: NotificationType
  data: NotificationData
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as { role: string } | null

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 요청 데이터 파싱
    const body: NotificationRequest = await request.json()
    const { phone, type, data } = body

    if (!phone || !type) {
      return NextResponse.json(
        { error: '전화번호와 알림 타입이 필요합니다.' },
        { status: 400 }
      )
    }

    // SMS 발송
    const result = await sendNotification(phone, type, data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'SMS 발송에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Notification API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
