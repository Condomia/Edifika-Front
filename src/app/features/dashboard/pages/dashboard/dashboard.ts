import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  map,
  of
} from 'rxjs';

import { environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly serverBaseUrl =
    environment.serverBaseUrl.replace(/\/+$/, '');

  /**
   * Obtiene los posts del muro comunitario.
   */
  getPosts(): Observable<any[]> {
    const url =
      `${this.serverBaseUrl}` +
      `${environment.postEndpointPath}`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),
      catchError(error => {
        console.error(
          'Error obteniendo los posts:',
          error
        );

        return of([]);
      })
    );
  }

  /**
   * Obtiene todas las unidades.
   *
   * GET /api/v1/residential/units
   */
  getAllUnits(): Observable<any[]> {
    const url =
      `${this.serverBaseUrl}` +
      `${environment.unitEndpointPath}`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),
      catchError(error => {
        console.error(
          'Error obteniendo todas las unidades:',
          error
        );

        return of([]);
      })
    );
  }

  /**
   * Obtiene las unidades de un edificio.
   *
   * Cuando buildingId es null, se obtienen todas
   * las unidades. Esto se usa para administradores
   * que no tienen un edificio asignado.
   */
  getUnitsByBuilding(
    buildingId: number | null
  ): Observable<any[]> {
    if (buildingId === null) {
      return this.getAllUnits();
    }

    const url =
      `${this.serverBaseUrl}` +
      `${environment.residentialEndpointPath}` +
      `/buildings/${buildingId}/units`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),

      catchError(error => {
        console.warn(
          'Falló la consulta de unidades por edificio. ' +
          'Se consultarán todas las unidades.',
          error
        );

        return this.getAllUnits().pipe(
          map(units => {
            const unitsWithBuildingId =
              units.filter(unit =>
                this.getUnitBuildingId(unit) !== null
              );

            /*
             * Si las unidades no incluyen buildingId,
             * no es posible filtrarlas localmente.
             */
            if (unitsWithBuildingId.length === 0) {
              return units;
            }

            return units.filter(unit =>
              this.getUnitBuildingId(unit) === buildingId
            );
          })
        );
      })
    );
  }

  /**
   * Obtiene todas las relaciones entre
   * usuarios y unidades.
   *
   * GET /api/v1/residential/user-units
   */
  getAllResidents(): Observable<any[]> {
    const url =
      `${this.serverBaseUrl}` +
      `${environment.userUnitEndpointPath}`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),
      catchError(error => {
        console.error(
          'Error obteniendo residentes:',
          error
        );

        return of([]);
      })
    );
  }

  /**
   * Obtiene los residentes relacionados
   * con un edificio.
   *
   * GET
   * /api/v1/residential/buildings/{buildingId}/residents
   */
  getResidentsByBuilding(
    buildingId: number | null
  ): Observable<any[]> {
    if (buildingId === null) {
      return this.getAllResidents();
    }

    const url =
      `${this.serverBaseUrl}` +
      `${environment.residentialEndpointPath}` +
      `/buildings/${buildingId}/residents`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),

      catchError(error => {
        console.warn(
          'Falló la consulta de residentes por edificio. ' +
          'Se consultarán todos los residentes.',
          error
        );

        return this.getAllResidents();
      })
    );
  }

  /**
   * Obtiene las deudas de una unidad.
   *
   * GET /api/v1/payments/debts/unit/{unitId}
   */
  getDebtsByUnit(
    unitId: number
  ): Observable<any[]> {
    const url =
      `${this.serverBaseUrl}` +
      `${environment.paymentEndpointPath}` +
      `/debts/unit/${unitId}`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),
      catchError(error => {
        console.error(
          `Error obteniendo las deudas de la unidad ${unitId}:`,
          error
        );

        return of([]);
      })
    );
  }

  /**
   * Obtiene los pagos realizados por un usuario.
   *
   * GET /api/v1/payments/user/{userId}
   */
  getPaymentsByUser(
    userId: number
  ): Observable<any[]> {
    const url =
      `${this.serverBaseUrl}` +
      `${environment.paymentEndpointPath}` +
      `/user/${userId}`;

    return this.http.get<any>(url).pipe(
      map(response => this.extractList(response)),
      catchError(error => {
        console.error(
          `Error obteniendo los pagos del usuario ${userId}:`,
          error
        );

        return of([]);
      })
    );
  }

  /**
   * Soporta diferentes estructuras de respuesta:
   *
   * []
   * { content: [] }
   * { data: [] }
   * { units: [] }
   * { residents: [] }
   * { payments: [] }
   * { debts: [] }
   * { posts: [] }
   */
  private extractList(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    const possibleLists = [
      response?.content,
      response?.data,
      response?.units,
      response?.residents,
      response?.userUnits,
      response?.payments,
      response?.debts,
      response?.posts
    ];

    const list = possibleLists.find(
      possibleList => Array.isArray(possibleList)
    );

    return list ?? [];
  }

  /**
   * Obtiene el buildingId soportando
   * diferentes nombres enviados por el backend.
   */
  private getUnitBuildingId(
    unit: any
  ): number | null {
    const value =
      unit.idBuilding ??
      unit.buildingId ??
      unit.building?.id ??
      unit.building?.idBuilding;

    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return null;
    }

    const parsedValue = Number(value);

    return Number.isNaN(parsedValue)
      ? null
      : parsedValue;
  }
}
