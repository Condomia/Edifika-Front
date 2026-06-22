import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { Reservation } from '../model/reservation.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService extends BaseService<Reservation> {
  override http = inject(HttpClient);
  override serverBaseUrl = environment.serverBaseUrl;

  constructor() {
    super();
    this.resourceEndpoint = environment.reservationEndpointPath;
  }

  createReservation(resource: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(
      `${this.serverBaseUrl}${environment.reservationEndpointPath}`,
      resource
    );
  }

  cancelReservation(reservationId: number | string): Observable<Reservation> {
    return this.http.post<Reservation>(
      `${this.serverBaseUrl}${environment.reservationEndpointPath}/${reservationId}/cancelations`,
      {}
    );
  }

  getAvailability(commonAreaId: number, date: string): Observable<Record<number, number>> {
    const params = new HttpParams()
      .set('commonAreaId', commonAreaId)
      .set('date', date);

    return this.http.get<Record<number, number>>(
      `${this.serverBaseUrl}${environment.reservationEndpointPath}/availability`,
      { params }
    );
  }
}
