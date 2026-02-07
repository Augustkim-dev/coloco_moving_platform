'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Home, Phone, MessageCircle } from 'lucide-react';
import { useEstimateStore } from '@/stores/estimateStore';
import { useChatStore } from '@/stores/chatStore';

export default function EstimateCompletePage() {
  const router = useRouter();
  const resetSchema = useEstimateStore((state) => state.resetSchema);
  const clearChat = useChatStore((state) => state.clearChat);

  const handleNewEstimate = () => {
    // 스토어 초기화
    resetSchema();
    clearChat();
    // 새 견적 페이지로 이동
    router.push('/estimate');
  };

  // 직접 접근 방지 (나중에 상태 확인 로직 추가 가능)
  useEffect(() => {
    // 예: estimateStore에서 제출 상태 확인
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          {/* 성공 아이콘 */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* 완료 메시지 */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">견적 요청 완료!</h1>
            <p className="text-muted-foreground">
              입력하신 정보로 견적 요청이 접수되었습니다.
            </p>
          </div>

          {/* 안내 사항 */}
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">연락 안내</p>
                <p className="text-muted-foreground">
                  빠른 시간 내에 이사업체에서 연락드릴 예정입니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium">견적 비교</p>
                <p className="text-muted-foreground">
                  여러 업체의 견적을 비교해보시고 결정하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="space-y-3 pt-2">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleNewEstimate}
            >
              새 견적 요청하기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 고객센터 안내 */}
      <p className="mt-6 text-sm text-muted-foreground text-center">
        문의사항이 있으시면{' '}
        <a href="tel:1588-0000" className="text-primary underline">
          1588-0000
        </a>
        으로 연락주세요.
      </p>
    </div>
  );
}
