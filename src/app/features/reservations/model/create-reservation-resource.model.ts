export interface CreateReservationResource {
  residentId: number;
  commonAreaId: number;
  reservationDate: string;
  timeSlot: number;
  numberOfGuests: number;

}
