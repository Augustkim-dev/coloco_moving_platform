/**
 * SMS 인증번호 확인 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, isValidPhone } from '@/lib/sms/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    // 입력 검증
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: '올바른 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!code || code.length < 4) {
      return NextResponse.json(
        { error: '인증번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 인증번호 검증
    const result = verifyCode(phone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '인증이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: '인증 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
