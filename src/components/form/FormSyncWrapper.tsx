'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEstimateStore } from '@/stores/estimateStore';
import type {
  MovingSchema,
  MoveCategory,
  MoveType,
  TimeSlot,
  Carrier,
  DateType,
  PartialMovingSchema,
  SquareFootage,
  VehiclePreference,
  ContactTime,
} from '@/types/schema';

// 값 목록 정의 (Zod enum용)
const MOVE_CATEGORIES = [
  'one_room',
  'two_room',
  'three_room_plus',
  'officetel',
  'apartment',
  'villa_house',
  'office',
  'unknown',
] as const;

const MOVE_TYPES = [
  'truck',
  'general',
  'half_pack',
  'full_pack',
  'storage',
  'unknown',
] as const;

const TIME_SLOTS = [
  'early_morning',
  'morning',
  'early_afternoon',
  'late_afternoon',
  'flexible',
  'unknown',
] as const;

const CARRIERS = ['SKT', 'KT', 'LGU+', '알뜰폰'] as const;

// Zod 스키마 정의 (폼 검증용)
export const estimateFormSchema = z.object({
  // Move 정보
  move: z.object({
    category: z.enum(MOVE_CATEGORIES).nullable(),
    type: z.enum(MOVE_TYPES).nullable(),
    schedule: z.string().nullable(),
    timeSlot: z.enum(TIME_SLOTS).nullable(),
  }),

  // 출발지
  departure: z.object({
    address: z.string().nullable(),
    addressDetail: z.string().nullable(),
    floor: z.number().nullable(),
    hasElevator: z.boolean().nullable(),
    canUseStairs: z.boolean().nullable(),
    parkingAvailable: z.boolean().nullable(),
    parkingDistance: z.string().nullable(),
    squareFootage: z.number().nullable(),
  }),

  // 도착지
  arrival: z.object({
    address: z.string().nullable(),
    addressDetail: z.string().nullable(),
    floor: z.number().nullable(),
    hasElevator: z.boolean().nullable(),
    canUseStairs: z.boolean().nullable(),
    parkingAvailable: z.boolean().nullable(),
    parkingDistance: z.string().nullable(),
    squareFootage: z.number().nullable(),
  }),

  // 짐 정보
  cargo: z.object({
    appliances: z.array(z.string()),
    furniture: z.array(z.string()),
    special: z.array(z.string()),
    boxes: z.object({
      small: z.number(),
      medium: z.number(),
      large: z.number(),
    }),
  }),

  // 부가 서비스
  services: z.object({
    ladderTruck: z.object({
      needed: z.boolean(),
      departure: z.boolean(),
      arrival: z.boolean(),
    }),
    airconInstall: z.object({
      needed: z.boolean(),
      count: z.number(),
    }),
    cleaning: z.object({
      needed: z.boolean(),
      type: z.string().nullable(),
    }),
    storage: z.object({
      needed: z.boolean(),
      duration: z.string().nullable(),
    }),
    disposal: z.object({
      needed: z.boolean(),
      items: z.array(z.string()),
    }),
  }),

  // 기타 조건
  conditions: z.object({
    extraRequests: z.string().nullable(),
    vehiclePreference: z.string().nullable(),
    customerParticipation: z.boolean().nullable(),
  }),

  // 연락처
  contact: z.object({
    name: z.string().nullable(),
    phone: z.string().nullable(),
    carrier: z.enum(CARRIERS).nullable(),
    preferredContactTime: z.string().nullable(),
  }),
});

export type EstimateFormData = z.infer<typeof estimateFormSchema>;

interface FormSyncWrapperProps {
  children: React.ReactNode;
}

// MovingSchema를 FormData로 변환 (스키마 구조가 다르므로 변환 필요)
function schemaToFormData(schema: MovingSchema): EstimateFormData {
  // 스키마의 hasElevator (YesNoUnknown)를 boolean으로 변환
  const elevatorToBoolean = (value: string | null): boolean | null => {
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return null;
  };

  // 스키마의 squareFootage (string)를 number로 변환
  const squareFootageToNumber = (value: string | null): number | null => {
    if (!value || value === 'unknown') return null;
    const mapping: Record<string, number> = {
      under_10: 10,
      '10_15': 15,
      '15_25': 20,
      '25_35': 30,
      '35_45': 40,
      over_45: 50,
    };
    return mapping[value] || null;
  };

  // 가전/가구 목록 추출
  const appliances: string[] = [];
  const furniture: string[] = [];

  // 가전제품 목록 생성
  if (schema.cargo.appliances.refrigerator.has) appliances.push('냉장고');
  if (schema.cargo.appliances.washer.has) appliances.push('세탁기');
  if (schema.cargo.appliances.tv.has) appliances.push('TV');
  if (schema.cargo.appliances.airConditioner.has) appliances.push('에어컨');
  if (schema.cargo.appliances.dryer.has) appliances.push('건조기');
  if (schema.cargo.appliances.dishwasher.has) appliances.push('식기세척기');

  // 가구 목록 생성
  if (schema.cargo.furniture.bed.has) furniture.push('침대');
  if (schema.cargo.furniture.wardrobe.has) furniture.push('옷장');
  if (schema.cargo.furniture.sofa.has) furniture.push('소파');
  if (schema.cargo.furniture.desk.has) furniture.push('책상');
  if (schema.cargo.furniture.bookshelf.has) furniture.push('책장');
  if (schema.cargo.furniture.diningTable.has) furniture.push('식탁');

  // 특수품목 목록 생성
  const special: string[] = [];
  if (schema.cargo.special.piano.has) special.push('피아노');
  if (schema.cargo.special.stoneBed.has) special.push('돌침대');
  if (schema.cargo.special.safe.has) special.push('금고');
  if (schema.cargo.special.aquarium.has) special.push('대형 어항');

  return {
    move: {
      category: schema.move.category as MoveCategory | null,
      type: schema.move.type as MoveType | null,
      schedule: schema.move.schedule.date,
      timeSlot: schema.move.timeSlot as TimeSlot | null,
    },
    departure: {
      address: schema.departure.address,
      addressDetail: schema.departure.detailAddress,
      floor: schema.departure.floor,
      hasElevator: elevatorToBoolean(schema.departure.hasElevator),
      canUseStairs: null,
      parkingAvailable: elevatorToBoolean(schema.departure.parking),
      parkingDistance: null,
      squareFootage: squareFootageToNumber(schema.departure.squareFootage),
    },
    arrival: {
      address: schema.arrival.address,
      addressDetail: schema.arrival.detailAddress,
      floor: schema.arrival.floor,
      hasElevator: elevatorToBoolean(schema.arrival.hasElevator),
      canUseStairs: null,
      parkingAvailable: elevatorToBoolean(schema.arrival.parking),
      parkingDistance: null,
      squareFootage: squareFootageToNumber(schema.arrival.squareFootage),
    },
    cargo: {
      appliances,
      furniture,
      special,
      boxes: {
        small: 0,
        medium: 0,
        large: schema.cargo.boxes.exactCount || 0,
      },
    },
    services: {
      ladderTruck: {
        needed: schema.services.ladderTruck === 'required',
        departure: false,
        arrival: false,
      },
      airconInstall: {
        needed: schema.services.airconInstall.needed,
        count: schema.services.airconInstall.qty,
      },
      cleaning: {
        needed: schema.services.cleaning,
        type: null,
      },
      storage: {
        needed: schema.services.storage.needed,
        duration: schema.services.storage.durationDays > 0
          ? `${schema.services.storage.durationDays}days`
          : null,
      },
      disposal: {
        needed: schema.services.disposal,
        items: [],
      },
    },
    conditions: {
      extraRequests: schema.conditions.extraRequests,
      vehiclePreference: schema.conditions.vehiclePreference,
      customerParticipation: schema.conditions.customerParticipation,
    },
    contact: {
      name: schema.contact.name,
      phone: schema.contact.phone,
      carrier: schema.contact.carrier as Carrier | null,
      preferredContactTime: schema.contact.preferredTime,
    },
  };
}

export function FormSyncWrapper({ children }: FormSyncWrapperProps) {
  const schema = useEstimateStore((state) => state.schema);
  const mergeSchema = useEstimateStore((state) => state.mergeSchema);
  const lastUpdateSourceRef = useRef<'form' | 'store' | null>(null);
  const isInitializedRef = useRef(false);

  const methods = useForm<EstimateFormData>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: schemaToFormData(schema),
    mode: 'onChange',
  });

  // 스토어 → 폼 동기화 (외부에서 스토어가 변경될 때)
  useEffect(() => {
    // 폼에서 변경된 경우 스킵
    if (lastUpdateSourceRef.current === 'form') {
      lastUpdateSourceRef.current = null;
      return;
    }

    const formData = schemaToFormData(schema);
    methods.reset(formData, { keepDirtyValues: false });
  }, [schema, methods]);

  // FormData를 MovingSchema 형식으로 변환
  const formDataToSchema = useCallback(
    (data: EstimateFormData): PartialMovingSchema => {
      // boolean을 YesNoUnknown으로 변환
      const booleanToYesNo = (
        value: boolean | null
      ): 'yes' | 'no' | 'unknown' => {
        if (value === true) return 'yes';
        if (value === false) return 'no';
        return 'unknown';
      };

      // number를 squareFootage 문자열로 변환
      const numberToSquareFootage = (value: number | null): SquareFootage | null => {
        if (!value) return null;
        if (value <= 10) return 'under_10';
        if (value <= 15) return '10_15';
        if (value <= 25) return '15_25';
        if (value <= 35) return '25_35';
        if (value <= 45) return '35_45';
        return 'over_45';
      };

      const dateType: DateType = data.move.schedule ? 'exact' : 'unknown';

      return {
        move: {
          category: data.move.category || 'unknown',
          type: data.move.type || 'unknown',
          schedule: {
            dateType,
            date: data.move.schedule,
            dateFrom: null,
            dateTo: null,
          },
          timeSlot: data.move.timeSlot || 'unknown',
        },
        departure: {
          address: data.departure.address,
          detailAddress: data.departure.addressDetail,
          floor: data.departure.floor,
          floorStatus: data.departure.floor !== null ? 'known' : 'unknown',
          hasElevator: booleanToYesNo(data.departure.hasElevator),
          parking: booleanToYesNo(data.departure.parkingAvailable),
          squareFootage: numberToSquareFootage(data.departure.squareFootage),
        },
        arrival: {
          address: data.arrival.address,
          detailAddress: data.arrival.addressDetail,
          floor: data.arrival.floor,
          floorStatus: data.arrival.floor !== null ? 'known' : 'unknown',
          hasElevator: booleanToYesNo(data.arrival.hasElevator),
          parking: booleanToYesNo(data.arrival.parkingAvailable),
          squareFootage: numberToSquareFootage(data.arrival.squareFootage),
        },
        services: {
          ladderTruck: data.services.ladderTruck.needed
            ? 'required'
            : 'not_required',
          airconInstall: {
            needed: data.services.airconInstall.needed,
            qty: data.services.airconInstall.count,
          },
          cleaning: data.services.cleaning.needed,
          organizing: false,
          storage: {
            needed: data.services.storage.needed,
            durationDays: 0,
          },
          disposal: data.services.disposal.needed,
        },
        conditions: {
          extraRequests: data.conditions.extraRequests,
          vehiclePreference: data.conditions.vehiclePreference as VehiclePreference | null,
          customerParticipation: data.conditions.customerParticipation,
        },
        contact: {
          name: data.contact.name,
          phone: data.contact.phone,
          carrier: data.contact.carrier,
          preferredTime: data.contact.preferredContactTime as ContactTime | null,
        },
      };
    },
    []
  );

  // 폼 → 스토어 동기화 (폼 값이 변경될 때)
  const syncToStore = useCallback(
    (data: EstimateFormData) => {
      lastUpdateSourceRef.current = 'form';
      mergeSchema(formDataToSchema(data));
    },
    [mergeSchema, formDataToSchema]
  );

  // 폼 변경 감지
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    const subscription = methods.watch((data) => {
      if (data) {
        syncToStore(data as EstimateFormData);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, syncToStore]);

  return <FormProvider {...methods}>{children}</FormProvider>;
}

// 폼 메서드 훅
export function useEstimateForm(): UseFormReturn<EstimateFormData> {
  const methods = useForm<EstimateFormData>();
  return methods;
}
