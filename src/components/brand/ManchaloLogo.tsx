import { cn } from '@/lib/utils';

interface ManchaloLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'w-8 h-8', text: 'text-lg', subtext: 'text-xs' },
  md: { icon: 'w-12 h-12', text: 'text-2xl', subtext: 'text-sm' },
  lg: { icon: 'w-16 h-16', text: 'text-3xl', subtext: 'text-base' },
  xl: { icon: 'w-20 h-20', text: 'text-4xl', subtext: 'text-lg' },
};

export function ManchaloLogo({ size = 'md', showText = true, className }: ManchaloLogoProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 트럭 아이콘 심볼 */}
      <div className={cn(
        'relative flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg',
        config.icon
      )}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 text-white"
        >
          {/* 트럭 본체 */}
          <path
            d="M1 12.5V16.5C1 17.0523 1.44772 17.5 2 17.5H3C3 18.6046 3.89543 19.5 5 19.5C6.10457 19.5 7 18.6046 7 17.5H13C13 18.6046 13.8954 19.5 15 19.5C16.1046 19.5 17 18.6046 17 17.5H18C18.5523 17.5 19 17.0523 19 16.5V12.5L16 6.5H11V12.5H1Z"
            fill="currentColor"
          />
          {/* 트럭 짐칸 */}
          <rect x="1" y="6.5" width="10" height="6" rx="1" fill="currentColor" opacity="0.8" />
          {/* 트럭 창문 */}
          <path
            d="M12 8.5H14.5L16.5 12.5H12V8.5Z"
            fill="white"
            opacity="0.3"
          />
          {/* 바퀴 */}
          <circle cx="5" cy="17.5" r="1.5" fill="white" />
          <circle cx="15" cy="17.5" r="1.5" fill="white" />
          {/* 속도선 효과 */}
          <path d="M0 10H-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <path d="M0 12H-3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <path d="M0 14H-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </svg>
        {/* 빠른 배송 표시 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-gray-900 tracking-tight', config.text)}>
            만차로
          </span>
          <span className={cn('text-orange-600 font-medium -mt-1', config.subtext)}>
            용달이사 전문
          </span>
        </div>
      )}
    </div>
  );
}

export function ManchaloIcon({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600',
      sizeMap[size],
      className
    )}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4 text-white"
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
    </div>
  );
}
