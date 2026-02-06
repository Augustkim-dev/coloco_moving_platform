/**
 * Chat API Route
 *
 * AI 파싱 프록시 - API 키를 서버에서 보호
 */

import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, initializeGemini } from '@/lib/gemini';

// POST /api/chat - 사용자 입력 파싱
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Gemini 클라이언트 초기화
    initializeGemini();

    if (!geminiClient.isInitialized()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // 파싱 모드에 따른 처리
    if (mode === 'parse') {
      const result = await geminiClient.parseMovingInput(message);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Parsing failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        confidence: result.confidence,
      });
    }

    // 기본 응답 (파싱 모드가 아닌 경우)
    return NextResponse.json({
      success: true,
      message: 'Echo: ' + message,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
