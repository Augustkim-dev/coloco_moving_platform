'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { useEstimateStore } from '@/stores/estimateStore';
import { getStepById } from '@/lib/guided-flow/steps';
import { ChatBubble } from './ChatBubble';
import { ChatInputBar } from './ChatInputBar';
import { GuidedStepRenderer } from './GuidedStepRenderer';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ChatWindowProps {
  className?: string;
}

export function ChatWindow({ className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    inputMode,
    isLoading,
    currentStepId,
    initializeChat,
    handleGuidedAnswer,
    revertToStep,
  } = useChatStore();

  const { schema, canSubmit } = useEstimateStore();
  const completionRate = schema.status.completionRate;

  // 초기화
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // 스크롤 하단 유지
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 현재 Step
  const currentStep = currentStepId ? getStepById(currentStepId) : null;

  // 메시지가 Step 입력을 포함하는지 확인
  const lastMessage = messages[messages.length - 1];
  const showStepInput =
    inputMode === 'guided' &&
    lastMessage?.role === 'system' &&
    lastMessage?.stepId &&
    lastMessage?.inputComponent;

  const handleAnswer = (value: unknown, displayText: string) => {
    if (currentStep) {
      handleGuidedAnswer(currentStep.id, value, displayText);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.stepId) {
      revertToStep(message.stepId);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 진행률 바 */}
      <div className="px-4 py-3 border-b bg-background">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">입력 진행률</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(completionRate * 100)}%
          </span>
        </div>
        <Progress value={completionRate * 100} className="h-2" />
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onEdit={message.editable ? handleEditMessage : undefined}
          />
        ))}

        {/* Step 입력 UI */}
        {showStepInput && currentStep && (
          <div className="mt-4 mb-2">
            <GuidedStepRenderer step={currentStep} onAnswer={handleAnswer} />
          </div>
        )}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 제출 가능 시 버튼 표시 */}
        {canSubmit() && (
          <div className="py-4">
            <Button className="w-full h-12 text-base" size="lg">
              견적 요청하기
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <ChatInputBar />
    </div>
  );
}
