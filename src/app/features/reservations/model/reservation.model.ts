export interface Reservation {
  id_reservation: number;
  id_common_area: number;
  id_user: number;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
}
