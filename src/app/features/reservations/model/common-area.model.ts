import { CommonAreaRule } from './common-area-rule.model';

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

export interface CommonArea {
  id: number;
  name: string;
  type: CommonAreaType;
  status: 'AVAILABLE' | 'MAINTENANCE';
  maxCapacity: number;
  bookingType: 'EXCLUSIVE' | 'SHARED';
  rules: CommonAreaRule | null;
}
