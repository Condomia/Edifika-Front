import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Reservation } from '../model/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends BaseService<Reservation> {
  override resourceEndpoint = 'reservations';
}
