'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Building2, TreeDeciduous } from 'lucide-react';

interface FloorInputProps {
  onConfirm: (floor: number) => void;
  initialValue?: number;
  className?: string;
}

export function FloorInput({
  onConfirm,
  initialValue = 1,
  className,
}: FloorInputProps) {
  const [floor, setFloor] = useState(initialValue);
  const [isUnderground, setIsUnderground] = useState(false);

  const handleIncrement = () => {
    if (isUnderground) {
      if (floor === -1) {
        setIsUnderground(false);
        setFloor(1);
      } else {
        setFloor((prev) => Math.min(prev + 1, -1));
      }
    } else {
      setFloor((prev) => Math.min(prev + 1, 99));
    }
  };

  const handleDecrement = () => {
    if (isUnderground) {
      setFloor((prev) => Math.max(prev - 1, -10));
    } else {
      if (floor === 1) {
        setFloor(0); // 반지하
      } else if (floor === 0) {
        setIsUnderground(true);
        setFloor(-1);
      } else {
        setFloor((prev) => Math.max(prev - 1, 1));
      }
    }
  };

  const handleToggleUnderground = () => {
    setIsUnderground(!isUnderground);
    setFloor(isUnderground ? 1 : -1);
  };

  const displayFloor = () => {
    if (floor === 0) return '반지하';
    if (floor < 0) return `지하 ${Math.abs(floor)}층`;
    return `${floor}층`;
  };

  const getActualFloor = () => {
    if (isUnderground) return floor;
    return floor;
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* 지상/지하 토글 */}
      <div className="flex gap-2">
        <Button
          variant={!isUnderground ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => {
            setIsUnderground(false);
            setFloor(1);
          }}
        >
          <Building2 className="w-4 h-4 mr-2" />
          지상
        </Button>
        <Button
          variant={isUnderground ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => {
            setIsUnderground(true);
            setFloor(-1);
          }}
        >
          <TreeDeciduous className="w-4 h-4 mr-2" />
          지하
        </Button>
      </div>

      {/* 층수 입력 */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleDecrement}
        >
          <Minus className="w-5 h-5" />
        </Button>

        <div className="flex flex-col items-center min-w-[100px]">
          <Input
            type="number"
            value={Math.abs(floor)}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 1;
              setFloor(isUnderground ? -Math.abs(value) : Math.abs(value));
            }}
            className="w-20 text-center text-2xl font-bold h-14 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={isUnderground ? 1 : 0}
            max={isUnderground ? 10 : 99}
          />
          <span className="text-sm text-muted-foreground mt-1">
            {displayFloor()}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleIncrement}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* 반지하 옵션 (지상 모드일 때만) */}
      {!isUnderground && (
        <Button
          variant={floor === 0 ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFloor(0)}
          className="self-center"
        >
          반지하
        </Button>
      )}

      {/* 확인 버튼 */}
      <Button
        className="w-full mt-2"
        onClick={() => onConfirm(getActualFloor())}
      >
        확인
      </Button>
    </div>
  );
}
