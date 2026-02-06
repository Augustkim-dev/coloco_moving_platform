/**
 * SMS 인증번호 발송 API
 *
 * Solapi SMS API를 통해 인증번호 발송
 * 실제 운영 시 환경 변수 설정 필요
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateVerificationCode,
  storeVerificationCode,
  hasRecentRequest,
  isValidPhone,
} from '@/lib/sms/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // 전화번호 검증
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: '올바른 전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');

    // 1분 내 재발송 제한
    if (hasRecentRequest(cleanPhone)) {
      return NextResponse.json(
        { error: '1분 후에 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 인증번호 생성 및 저장
    const code = generateVerificationCode();
    storeVerificationCode(cleanPhone, code);

    // Solapi SMS 발송 (환경 변수 설정 필요)
    const apiKey = process.env.SOLAPI_API_KEY;
    const apiSecret = process.env.SOLAPI_API_SECRET;
    const sender = process.env.SOLAPI_SENDER;

    if (apiKey && apiSecret && sender) {
      // 실제 SMS 발송
      try {
        const timestamp = new Date().toISOString();
        const salt = Math.random().toString(36).substring(2, 15);

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
                text: `[이사매칭] 인증번호: ${code}\n3분 내에 입력해주세요.`,
              },
            }),
          }
        );

        if (!response.ok) {
          console.error('SMS send failed:', await response.text());
        }
      } catch (smsError) {
        console.error('SMS API error:', smsError);
      }
    } else {
      // 개발 환경: 콘솔에 인증번호 출력
      console.log(`[DEV] Verification code for ${cleanPhone}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: '인증번호가 발송되었습니다.',
      // 개발 환경에서만 코드 반환 (프로덕션에서는 제거)
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: '인증번호 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
