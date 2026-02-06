'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/stores/chatStore';
import { Edit3 } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  onEdit?: (messageId: string) => void;
}

export function ChatBubble({ message, onEdit }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAI = message.role === 'ai';

  return (
    <div
      className={cn(
        'flex w-full mb-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 relative group',
          isUser && 'bg-primary text-primary-foreground rounded-br-sm',
          isSystem && 'bg-muted text-foreground rounded-bl-sm',
          isAI && 'bg-blue-50 text-foreground border border-blue-100 rounded-bl-sm'
        )}
      >
        {/* AI 뱃지 */}
        {isAI && (
          <span className="absolute -top-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            AI
          </span>
        )}

        {/* 메시지 내용 */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* 수정 버튼 (사용자 메시지만) */}
        {isUser && message.editable && onEdit && (
          <button
            onClick={() => onEdit(message.id)}
            className="absolute -right-2 -top-2 p-1 bg-background border rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="수정"
          >
            <Edit3 className="w-3 h-3 text-muted-foreground" />
          </button>
        )}

        {/* 수정됨 표시 */}
        {message.editedAt && (
          <span className="text-xs text-muted-foreground mt-1 block">
            (수정됨)
          </span>
        )}

        {/* Confidence 표시 (AI 메시지) */}
        {isAI && message.confidence !== undefined && (
          <span className="text-xs text-muted-foreground mt-1 block">
            확신도: {Math.round(message.confidence * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
