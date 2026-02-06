/**
 * SMS 인증 유틸리티
 *
 * 인증번호 생성, 저장, 검증 로직
 * 실제 운영 시 Redis 또는 DB 사용 권장
 */

// 인증번호 데이터 타입
interface VerificationData {
  code: string;
  expiresAt: number;
  attempts: number;
}

// 인증번호 저장소 (메모리 기반)
// 실제 운영에서는 Redis나 DB 사용 권장
const verificationStore = new Map<string, VerificationData>();

/**
 * 6자리 인증번호 생성
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 인증번호 저장
 */
export function storeVerificationCode(phone: string, code: string): void {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  verificationStore.set(cleanPhone, {
    code,
    expiresAt: Date.now() + 180000, // 3분 후 만료
    attempts: 0,
  });
}

/**
 * 인증번호 검증
 */
export function verifyCode(
  phone: string,
  code: string
): { success: boolean; error?: string } {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const data = verificationStore.get(cleanPhone);

  if (!data) {
    return { success: false, error: '인증번호를 먼저 요청해주세요.' };
  }

  // 만료 확인
  if (Date.now() > data.expiresAt) {
    verificationStore.delete(cleanPhone);
    return { success: false, error: '인증번호가 만료되었습니다.' };
  }

  // 시도 횟수 확인 (최대 5회)
  if (data.attempts >= 5) {
    verificationStore.delete(cleanPhone);
    return { success: false, error: '인증 시도 횟수를 초과했습니다.' };
  }

  // 코드 비교
  if (data.code !== code) {
    data.attempts++;
    return { success: false, error: '인증번호가 일치하지 않습니다.' };
  }

  // 성공 - 코드 삭제
  verificationStore.delete(cleanPhone);
  return { success: true };
}

/**
 * 최근 요청 확인 (1분 이내)
 */
export function hasRecentRequest(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const data = verificationStore.get(cleanPhone);

  if (!data) return false;

  // 생성 후 1분 이내인지 확인
  const createdAt = data.expiresAt - 180000;
  return Date.now() - createdAt < 60000;
}

/**
 * 만료된 코드 정리
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  for (const [phone, data] of verificationStore.entries()) {
    if (data.expiresAt < now) {
      verificationStore.delete(phone);
    }
  }
}

// 주기적 정리 (5분마다)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredCodes, 300000);
}

/**
 * 전화번호 유효성 검증
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}
