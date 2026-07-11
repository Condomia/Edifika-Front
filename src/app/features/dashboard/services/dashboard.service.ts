import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  catchError,
  map,
  of
} from 'rxjs';

import { environment } from
    '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    environment.serverBaseUrl.replace(
      /\/+$/,
      ''
    );

  /**
   * GET /api/v1/posts
   */
  getPosts(): Observable<any[]> {
    const url =
      `${this.baseUrl}` +
      `${environment.postEndpointPath}`;

    return this.http
      .get<any>(url)
      .pipe(
        map(response =>
          this.extractList(response)
        ),

        catchError(error => {
          console.error(
            'Error obteniendo posts:',
            error
          );

          return of([]);
        })
      );
  }

  /**
   * GET
   * /api/v1/payments/debts/unit/{unitId}
   */
  getDebtsByUnit(
    unitId: number
  ): Observable<any[]> {
    const url =
      `${this.baseUrl}` +
      `${environment.paymentEndpointPath}` +
      `/debts/unit/${unitId}`;

    return this.http
      .get<any>(url)
      .pipe(
        map(response =>
          this.extractList(response)
        ),

        catchError(error => {
          console.error(
            `Error obteniendo las deudas ` +
            `de la unidad ${unitId}:`,
            error
          );

          return of([]);
        })
      );
  }

  /**
   * GET
   * /api/v1/payments/user/{userId}
   */
  getPaymentsByUser(
    userId: number
  ): Observable<any[]> {
    const url =
      `${this.baseUrl}` +
      `${environment.paymentEndpointPath}` +
      `/user/${userId}`;

    return this.http
      .get<any>(url)
      .pipe(
        map(response =>
          this.extractList(response)
        ),

        catchError(error => {
          console.error(
            `Error obteniendo los pagos ` +
            `del usuario ${userId}:`,
            error
          );

          return of([]);
        })
      );
  }

  /**
   * Soporta respuestas directas y respuestas
   * envueltas en un objeto.
   */
  private extractList(
    response: any
  ): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    const possibleLists = [
      response?.content,
      response?.data,
      response?.posts,
      response?.debts,
      response?.payments
    ];

    const list =
      possibleLists.find(
        value =>
          Array.isArray(value)
      );

    return list ?? [];
  }
}
