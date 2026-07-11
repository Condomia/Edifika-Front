import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { Reservation } from '../model/reservation.model';
import { CreateReservationResource } from '../model/create-reservation-resource.model';
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

  createReservation(resource: CreateReservationResource): Observable<Reservation> {
    return this.http.post<Reservation>(
      this.resourcePath(),
      resource,
      this.httpOptions
    );
  }

  cancelReservation(reservationId: number | string): Observable<Reservation> {
    return this.http.post<Reservation>(
      `${this.resourcePath()}/${reservationId}/cancelations`,
      {},
      this.httpOptions
    );
  }

  getAvailability(commonAreaId: number, date: string): Observable<Record<number, number>> {
    const params = new HttpParams()
      .set('commonAreaId', commonAreaId)
      .set('date', date);

    return this.http.get<Record<number, number>>(
      `${this.resourcePath()}/availability`,
      { ...this.httpOptions, params }
    );
  }
}
