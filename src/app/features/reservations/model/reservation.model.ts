export interface Reservation {
  id?: number | string;
  residentId: number;
  commonAreaId: number | string;
  reservationDate: string;
  timeSlot: number;
  numberOfGuests?: number;
  status: 'ACTIVE' | 'CANCELLED';
  qrCodeAccess: string;
  penaltyApplied: boolean;
}
