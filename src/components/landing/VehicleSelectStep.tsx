'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { VehicleType } from '@/types/schema';
import { VEHICLE_DATA, VEHICLE_TYPE_LABELS } from '@/types/schema';

interface VehicleSelectStepProps {
  onSelect: (value: VehicleType) => void;
}

export function VehicleSelectStep({ onSelect }: VehicleSelectStepProps) {
  const [detailType, setDetailType] = useState<VehicleType | null>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">물품 총량을 예측하여 적재 차종을 선택하다</h2>
        <p className="text-sm text-gray-500 mt-1">이사 짐 양에 맞는 차량을 선택해주세요</p>
      </div>

      <div className="flex flex-col gap-3">
        {VEHICLE_DATA.map((vehicle) => (
          <div
            key={vehicle.type}
            className="rounded-xl border-2 border-gray-200 overflow-hidden bg-white"
          >
            <div className="flex">
              {/* 왼쪽: 이미지 + 상세보기 */}
              <div className="w-32 shrink-0 bg-amber-50 flex flex-col items-center justify-center p-3">
                <div className="relative w-24 h-16">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() => setDetailType(detailType === vehicle.type ? null : vehicle.type)}
                  className="mt-2 text-xs font-bold text-primary flex items-center gap-0.5"
                >
                  상세보기
                  <span className="text-primary">&#9654;</span>
                </button>
              </div>

              {/* 오른쪽: 정보 + 선택 버튼 */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {vehicle.name}은 {vehicle.startPrice} 시작한다.
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{vehicle.description}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    <span>{vehicle.capacity}</span>
                    <br />
                    <span className="font-medium text-gray-600">{vehicle.dimensions}</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(vehicle.type)}
                  className="mt-3 self-end px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  즉시 선택하다
                </button>
              </div>
            </div>

            {/* 상세 정보 패널 */}
            {detailType === vehicle.type && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-4 mb-3">
                  {VEHICLE_DATA.map((v) => (
                    <button
                      key={v.type}
                      onClick={() => setDetailType(v.type)}
                      className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                        detailType === v.type
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center mb-3">
                  <div className="relative w-48 h-28">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    적재 치수: {vehicle.dimensions}
                  </p>
                  <p className="text-xs text-gray-500">{vehicle.description}</p>
                  <p className="text-xs text-gray-400 mt-1">*사이즈는 실제 수주 차량 기준</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setDetailType(null)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    되돌아가다.
                  </button>
                  <button
                    onClick={() => onSelect(vehicle.type)}
                    className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90"
                  >
                    주문하러 가다
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
