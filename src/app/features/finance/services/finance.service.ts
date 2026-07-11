import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  Building,
  CreateNotificationRequest,
  Debt,
  FinancialReportResource,
  Payment,
  Unit,
  User,
  UserUnit} from '../model/finance.models';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    environment.serverBaseUrl.replace(/\/+$/, '');

  private readonly reportPath =
    environment.reportEndpointPath ?? '/reports';

  private readonly paymentPath =
    environment.paymentEndpointPath ?? '/payments';

  private readonly unitPath =
    environment.unitEndpointPath ?? '/residential/units';

  private readonly userUnitPath =
    environment.userUnitEndpointPath ??
    '/residential/user-units';

  private readonly userPath =
    environment.userEndpointPath ?? '/users';

  private readonly buildingPath =
    environment.buildingEndpointPath ??
    '/residential/buildings';

  private readonly notificationPath =
    environment.notificationEndpointPath ??
    '/notifications';

  /**
   * Indicadores principales calculados por Report.
   */
  getFinancialReport(
    buildingId: number
  ): Observable<FinancialReportResource> {
    return this.http.get<FinancialReportResource>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.reportPath)}` +
      `/financial/buildings/${buildingId}`
    );
  }


  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.unitPath)}`
    );
  }


  getUserUnits(): Observable<UserUnit[]> {
    return this.http.get<UserUnit[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.userUnitPath)}`
    );
  }


  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.userPath)}`
    );
  }


  getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.buildingPath)}`
    );
  }


  getDebtsByUnit(
    unitId: number
  ): Observable<Debt[]> {
    return this.http.get<Debt[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.paymentPath)}` +
      `/debts/unit/${unitId}`
    );
  }


  getPaymentsByUser(
    userId: number
  ): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.baseUrl}` +
      `${this.normalizePath(this.paymentPath)}` +
      `/user/${userId}`
    );
  }

  
  sendNotification(
    request: CreateNotificationRequest
  ): Observable<unknown> {
    return this.http.post(
      `${this.baseUrl}` +
      `${this.normalizePath(this.notificationPath)}`,
      request
    );
  }

  private normalizePath(path: string): string {
    return path.startsWith('/')
      ? path
      : `/${path}`;
  }
}
