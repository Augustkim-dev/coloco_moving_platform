'use client';

import { cn } from '@/lib/utils';

interface ManchaloFooterBannerProps {
  className?: string;
}

export function ManchaloFooterBanner({ className }: ManchaloFooterBannerProps) {
  return (
    <div
      className={cn(
        'w-full pointer-events-none select-none',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-3 opacity-30">
        {/* 트럭 아이콘 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-400"
        >
          <path
            d="M1 12.5V16.5C1 17.0523 1.44772 17.5 2 17.5H3C3 18.6046 3.89543 19.5 5 19.5C6.10457 19.5 7 18.6046 7 17.5H13C13 18.6046 13.8954 19.5 15 19.5C16.1046 19.5 17 18.6046 17 17.5H18C18.5523 17.5 19 17.0523 19 16.5V12.5L16 6.5H11V12.5H1Z"
            fill="currentColor"
          />
          <rect x="1" y="6.5" width="10" height="6" rx="1" fill="currentColor" opacity="0.8" />
          <path d="M12 8.5H14.5L16.5 12.5H12V8.5Z" fill="white" opacity="0.3" />
          <circle cx="5" cy="17.5" r="1.5" fill="white" />
          <circle cx="15" cy="17.5" r="1.5" fill="white" />
        </svg>
        <span className="text-gray-400 font-medium text-xs">만차로</span>
      </div>
    </div>
  );
}
