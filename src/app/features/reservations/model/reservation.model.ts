export interface Reservation {
  id: number;
  residentId: number;
  commonAreaId: number;
  reservationDate: string;
  timeSlot: number;
  numberOfGuests: number;
  status: 'ACTIVE' | 'CANCELLED';
  qrCodeAccess: string;
  penaltyApplied: boolean;
}
