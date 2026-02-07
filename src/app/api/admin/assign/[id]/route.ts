import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UpdateMatchingRequest {
  status?: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'completed'
  adminMemo?: string | null
}

interface ChangeCompanyRequest {
  newCompanyId: string
  reason?: string
}

// GET: 배정 상세 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchingId } = await params
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

    // 배정 정보 조회
    const { data: matchingData, error } = await supabase
      .from('matchings')
      .select('*, company:companies(*), estimate:estimates(*)')
      .eq('id', matchingId)
      .single()

    if (error || !matchingData) {
      return NextResponse.json(
        { error: '배정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ matching: matchingData })
  } catch (error) {
    console.error('Get matching error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 배정 상태 변경
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchingId } = await params
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
    const body: UpdateMatchingRequest = await request.json()
    const { status, adminMemo } = body

    // 현재 배정 정보 확인
    const { data: matchingData, error: matchingError } = await supabase
      .from('matchings')
      .select('*, estimate:estimates(id, status)')
      .eq('id', matchingId)
      .single()

    if (matchingError || !matchingData) {
      return NextResponse.json(
        { error: '배정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 상태 업데이트
    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'completed') {
        updateData.responded_at = new Date().toISOString()
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedMatching, error: updateError } = await (supabase as any)
      .from('matchings')
      .update(updateData)
      .eq('id', matchingId)
      .select()
      .single()

    if (updateError) {
      console.error('Update matching error:', updateError)
      return NextResponse.json(
        { error: '상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 완료 상태로 변경 시 견적도 완료로 업데이트
    if (status === 'completed') {
      const matching = matchingData as { estimate: { id: string } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('estimates')
        .update({ status: 'completed' })
        .eq('id', matching.estimate.id)
    }

    // 거절/취소 시 견적 상태를 submitted로 되돌림
    if (status === 'rejected' || status === 'timeout') {
      const matching = matchingData as { estimate: { id: string } }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('estimates')
        .update({ status: 'submitted' })
        .eq('id', matching.estimate.id)
    }

    return NextResponse.json({
      success: true,
      matching: updatedMatching,
      message: '상태가 변경되었습니다.',
    })
  } catch (error) {
    console.error('Update matching error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 배정 취소
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchingId } = await params
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

    // 현재 배정 정보 확인
    const { data: matchingData, error: matchingError } = await supabase
      .from('matchings')
      .select('*, estimate:estimates(id)')
      .eq('id', matchingId)
      .single()

    if (matchingError || !matchingData) {
      return NextResponse.json(
        { error: '배정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 배정 상태를 rejected로 변경 (soft delete)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('matchings')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', matchingId)

    if (updateError) {
      console.error('Cancel matching error:', updateError)
      return NextResponse.json(
        { error: '배정 취소에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 견적 상태를 submitted로 되돌림
    const matching = matchingData as { estimate: { id: string } }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('estimates')
      .update({ status: 'submitted' })
      .eq('id', matching.estimate.id)

    return NextResponse.json({
      success: true,
      message: '배정이 취소되었습니다.',
    })
  } catch (error) {
    console.error('Delete matching error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 업체 변경
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchingId } = await params
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
    const body: ChangeCompanyRequest = await request.json()
    const { newCompanyId, reason } = body

    if (!newCompanyId) {
      return NextResponse.json(
        { error: '새 업체 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 현재 배정 정보 확인
    const { data: matchingData, error: matchingError } = await supabase
      .from('matchings')
      .select('*, estimate:estimates(id)')
      .eq('id', matchingId)
      .single()

    if (matchingError || !matchingData) {
      return NextResponse.json(
        { error: '배정 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 새 업체 확인
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id, status, business_name')
      .eq('id', newCompanyId)
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

    // 기존 배정을 rejected로 변경
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('matchings')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('id', matchingId)

    // 새 배정 생성
    const matching = matchingData as { estimate: { id: string }; attempt_number: number }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newMatching, error: insertError } = await (supabase as any)
      .from('matchings')
      .insert({
        estimate_id: matching.estimate.id,
        company_id: newCompanyId,
        status: 'accepted',
        attempt_number: (matching.attempt_number || 0) + 1,
        responded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert new matching error:', insertError)
      return NextResponse.json(
        { error: '업체 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      matching: newMatching,
      message: `${company.business_name}(으)로 변경되었습니다.`,
    })
  } catch (error) {
    console.error('Change company error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
