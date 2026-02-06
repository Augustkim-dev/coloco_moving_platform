/**
 * Gemini AI Client
 *
 * 이사 정보 파싱을 위한 Gemini 2.5 Flash API 클라이언트
 * JSON 모드 응답 설정으로 구조화된 데이터 추출
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { formatParsePrompt } from './prompts';
import type {
  PartialMovingSchema,
  MoveCategory,
  MoveType,
  TimeSlot,
  SquareFootage,
} from '@/types/schema';

// 파싱 결과 타입
export interface ParseResult {
  success: boolean;
  data: PartialMovingSchema | null;
  confidence: Record<string, number>;
  rawResponse?: string;
  error?: string;
}

// Gemini 클라이언트 클래스
class GeminiClient {
  private model: GenerativeModel | null = null;
  private apiKey: string | null = null;

  /**
   * 클라이언트 초기화
   */
  initialize(apiKey: string) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Gemini 2.5 Flash 모델 사용 (빠르고 저렴)
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1, // 낮은 온도로 일관된 결과
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json', // JSON 모드
      },
    });
  }

  /**
   * 사용자 입력에서 이사 정보 파싱
   */
  async parseMovingInput(userInput: string): Promise<ParseResult> {
    if (!this.model) {
      return {
        success: false,
        data: null,
        confidence: {},
        error: 'Gemini client not initialized',
      };
    }

    try {
      const prompt = formatParsePrompt(userInput);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSON 파싱
      const parsed = JSON.parse(text);

      // 결과 검증 및 변환
      const movingData = this.transformToSchema(parsed);
      const confidenceMap = this.extractConfidence(parsed);

      return {
        success: true,
        data: movingData,
        confidence: confidenceMap,
        rawResponse: text,
      };
    } catch (error) {
      console.error('Gemini parsing error:', error);
      return {
        success: false,
        data: null,
        confidence: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * AI 응답을 MovingSchema 형식으로 변환
   */
  private transformToSchema(parsed: Record<string, unknown>): PartialMovingSchema {
    const result: PartialMovingSchema = {};

    // 이사 기본 정보
    if (parsed.move) {
      const move = parsed.move as Record<string, unknown>;
      result.move = {};

      if (move.category) result.move.category = move.category as MoveCategory;
      if (move.type) result.move.type = move.type as MoveType;
      if (move.timeSlot) result.move.timeSlot = move.timeSlot as TimeSlot;
      if (move.date) {
        result.move.schedule = {
          dateType: 'exact',
          date: move.date as string,
          dateFrom: null,
          dateTo: null,
        };
      }
    }

    // 출발지 정보
    if (parsed.departure) {
      const dep = parsed.departure as Record<string, unknown>;
      result.departure = {};

      if (dep.address) result.departure.address = dep.address as string;
      if (dep.floor !== undefined) result.departure.floor = dep.floor as number;
      if (dep.hasElevator !== undefined) {
        result.departure.hasElevator = dep.hasElevator ? 'yes' : 'no';
      }
      if (dep.squareFootage) {
        result.departure.squareFootage = this.mapSquareFootage(
          dep.squareFootage as number
        );
      }
    }

    // 도착지 정보
    if (parsed.arrival) {
      const arr = parsed.arrival as Record<string, unknown>;
      result.arrival = {};

      if (arr.address) result.arrival.address = arr.address as string;
      if (arr.floor !== undefined) result.arrival.floor = arr.floor as number;
      if (arr.hasElevator !== undefined) {
        result.arrival.hasElevator = arr.hasElevator ? 'yes' : 'no';
      }
    }

    // 조건 정보
    if (parsed.conditions) {
      const cond = parsed.conditions as Record<string, unknown>;
      result.conditions = {};

      if (cond.extraRequests) {
        result.conditions.extraRequests = cond.extraRequests as string;
      }
    }

    // 연락처 정보
    if (parsed.contact) {
      const contact = parsed.contact as Record<string, unknown>;
      result.contact = {};

      if (contact.name) result.contact.name = contact.name as string;
      if (contact.phone) result.contact.phone = contact.phone as string;
    }

    return result;
  }

  /**
   * 평수를 스키마 값으로 변환
   */
  private mapSquareFootage(value: number): SquareFootage {
    if (value <= 10) return 'under_10';
    if (value <= 15) return '10_15';
    if (value <= 25) return '15_25';
    if (value <= 35) return '25_35';
    if (value <= 45) return '35_45';
    return 'over_45';
  }

  /**
   * 신뢰도 맵 추출
   */
  private extractConfidence(
    parsed: Record<string, unknown>
  ): Record<string, number> {
    const confidence: Record<string, number> = {};

    if (parsed.confidence && typeof parsed.confidence === 'object') {
      const conf = parsed.confidence as Record<string, unknown>;
      for (const [key, value] of Object.entries(conf)) {
        if (typeof value === 'number') {
          confidence[key] = value;
        }
      }
    }

    return confidence;
  }

  /**
   * 클라이언트 초기화 여부 확인
   */
  isInitialized(): boolean {
    return this.model !== null;
  }
}

// 싱글톤 인스턴스
export const geminiClient = new GeminiClient();

// 서버 사이드에서 환경 변수로 초기화
export function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && !geminiClient.isInitialized()) {
    geminiClient.initialize(apiKey);
  }
}
