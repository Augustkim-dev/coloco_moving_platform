'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, X, Loader2 } from 'lucide-react';

// 카카오 주소 검색 결과 타입
interface KakaoAddress {
  address_name: string; // 전체 지번 주소
  address_type: string; // REGION | ROAD | REGION_ADDR | ROAD_ADDR
  road_address_name?: string; // 도로명 주소
  x: string; // 경도
  y: string; // 위도
}

// 다음(카카오) 우편번호 서비스 결과 타입
interface DaumPostcodeData {
  address: string; // 기본 주소
  roadAddress: string; // 도로명 주소
  jibunAddress: string; // 지번 주소
  zonecode: string; // 우편번호
  buildingName?: string; // 건물명
  apartment?: 'Y' | 'N'; // 아파트 여부
}

interface AddressSearchProps {
  onSelect: (address: string, detail?: { roadAddress?: string; zonecode?: string }) => void;
  placeholder?: string;
  initialValue?: string;
}

// 카카오 우편번호 서비스 스크립트 로드
function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as { daum?: { Postcode?: unknown } }).daum?.Postcode) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Daum Postcode script'));
    document.head.appendChild(script);
  });
}

export function AddressSearch({
  onSelect,
  placeholder = '주소를 검색하세요',
  initialValue = '',
}: AddressSearchProps) {
  const [address, setAddress] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // 스크립트 로드
  useEffect(() => {
    loadDaumPostcodeScript()
      .then(() => setIsScriptLoaded(true))
      .catch((error) => console.error('Postcode script load error:', error));
  }, []);

  // 주소 검색 팝업 열기
  const openAddressSearch = useCallback(() => {
    if (!isScriptLoaded) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSearching(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const daum = (window as any).daum;

    new daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        // 도로명 주소 우선, 없으면 지번 주소
        const selectedAddress = data.roadAddress || data.jibunAddress || data.address;

        setAddress(selectedAddress);
        onSelect(selectedAddress, {
          roadAddress: data.roadAddress,
          zonecode: data.zonecode,
        });
        setIsSearching(false);
      },
      onclose: () => {
        setIsSearching(false);
      },
      width: '100%',
      height: '100%',
    }).open({
      // 팝업 위치 조정 (모바일 대응)
      popupName: 'postcodePopup',
      autoClose: true,
    });
  }, [isScriptLoaded, onSelect]);

  // 주소 초기화
  const clearAddress = () => {
    setAddress('');
    onSelect('');
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={address}
              placeholder={placeholder}
              readOnly
              className="pl-9 pr-8 cursor-pointer"
              onClick={openAddressSearch}
            />
            {address && (
              <button
                type="button"
                onClick={clearAddress}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={openAddressSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 선택된 주소 표시 */}
        {address && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 간단한 주소 표시 컴포넌트
export function AddressDisplay({ address }: { address: string }) {
  if (!address) return null;

  return (
    <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
      <MapPin className="h-4 w-4 text-primary shrink-0" />
      <span className="truncate">{address}</span>
    </div>
  );
}
