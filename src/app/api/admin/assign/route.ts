import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAssignmentNotifications } from '@/lib/notification/send'
import type { MovingSchema } from '@/types/schema'

interface AssignRequest {
  estimateId: string
  companyId: string
  adminMemo?: string | null
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
    const body: AssignRequest = await request.json()
    const { estimateId, companyId, adminMemo } = body

    if (!estimateId || !companyId) {
      return NextResponse.json(
        { error: '견적 ID와 업체 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 견적 존재 및 상태 확인
    const { data: estimateData, error: estimateError } = await supabase
      .from('estimates')
      .select('id, status, phone, schema_data')
      .eq('id', estimateId)
      .single()

    const estimate = estimateData as {
      id: string
      status: string
      phone: string | null
      schema_data: unknown
    } | null

    if (estimateError || !estimate) {
      return NextResponse.json(
        { error: '견적을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (estimate.status !== 'submitted' && estimate.status !== 'matching') {
      return NextResponse.json(
        { error: '배정 가능한 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    // 업체 존재 및 상태 확인
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, status, business_name')
      .eq('id', companyId)
      .single()

    const company = companyData as { id: string; status: string; business_name: string } | null

    if (companyError || !company) {
      return NextResponse.json(
        { error: '업체를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (company.status !== 'active') {
      return NextResponse.json(
        { error: '활성 상태의 업체만 배정할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 기존 배정 확인 (pending/accepted 상태)
    const { data: existingMatching } = await supabase
      .from('matchings')
      .select('id')
      .eq('estimate_id', estimateId)
      .in('status', ['pending', 'accepted'])
      .single()

    if (existingMatching) {
      return NextResponse.json(
        { error: '이미 배정된 견적입니다.' },
        { status: 400 }
      )
    }

    // 이전 배정 수 확인 (attempt_number 계산용)
    const { count: prevMatchingsCount } = await supabase
      .from('matchings')
      .select('*', { count: 'exact', head: true })
      .eq('estimate_id', estimateId)

    const attemptNumber = (prevMatchingsCount || 0) + 1

    // 새 배정 생성 - eslint-disable로 any 타입 사용
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newMatching, error: matchingError } = await (supabase as any)
      .from('matchings')
      .insert({
        estimate_id: estimateId,
        company_id: companyId,
        status: 'accepted',
        attempt_number: attemptNumber,
        match_score: null,
        responded_at: new Date().toISOString(),
        admin_memo: adminMemo || null,
      })
      .select()
      .single()

    if (matchingError) {
      console.error('Matching insert error:', matchingError)
      return NextResponse.json(
        { error: '배정 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 견적 상태 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('estimates')
      .update({ status: 'matched' })
      .eq('id', estimateId)

    if (updateError) {
      console.error('Estimate update error:', updateError)
      // 롤백: 방금 생성한 matching 삭제
      await supabase.from('matchings').delete().eq('id', newMatching.id)
      return NextResponse.json(
        { error: '견적 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    // SMS 알림 발송
    const schema = estimate.schema_data as MovingSchema
    const customerPhone = schema?.contact?.phone || estimate.phone

    if (customerPhone) {
      try {
        await sendAssignmentNotifications({
          customerPhone,
          customerName: schema?.contact?.name || undefined,
          companyName: company.business_name,
          moveDate: schema?.move?.schedule?.date || undefined,
          moveType: schema?.move?.type || undefined,
          departureAddress: schema?.departure?.address || undefined,
          arrivalAddress: schema?.arrival?.address || undefined,
        })
      } catch (smsError) {
        // SMS 발송 실패는 배정 성공에 영향 없음
        console.error('SMS notification error:', smsError)
      }
    }

    return NextResponse.json({
      success: true,
      matching: newMatching,
      message: `${company.business_name}에 배정되었습니다.`,
    })
  } catch (error) {
    console.error('Assign API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
