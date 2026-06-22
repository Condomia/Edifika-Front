export type CommonAreaType =
  | 'POOL'
  | 'GYM'
  | 'COWORKING_ROOM'
  | 'BBQ_AREA'
  | 'PARTY_ROOM'
  | 'MEETING_ROOM'
  | 'SPORTS_COURT'
  | 'PLAYGROUND'
  | 'TERRACE'
  | 'LOUNGE'
  | 'PARKING_AREA'
  | 'LAUNDRY_ROOM'
  | 'PET_AREA'
  | 'GARDEN'
  | 'MULTIPURPOSE_ROOM';

export interface CommonAreaRule {
  maxReservationHours: number;
  requiresPayment: boolean;
  price: number;
  requiresGuarantee: boolean;
  guaranteeAmount: number;
  allowCancellation: boolean;
  penaltyHoursBefore: number;
  penaltyAmount: number;
  requiresApproval: boolean;
}

