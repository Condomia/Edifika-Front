import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface PageResponse<T> {
  content: T[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private serverBaseUrl = environment.serverBaseUrl;

  getPosts(): Observable<any[]> {
    return this.http
      .get<PageResponse<any>>(`${this.serverBaseUrl}/posts`)
      .pipe(map(response => response.content ?? []));
  }

  getUnitsByBuilding(buildingId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverBaseUrl}/residential/buildings/${buildingId}/units`
    );
  }

  getResidentsByBuilding(buildingId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverBaseUrl}/residential/buildings/${buildingId}/residents`
    );
  }

  getDebtsByUnit(unitId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverBaseUrl}/payments/debts/unit/${unitId}`
    );
  }

  getPaymentsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.serverBaseUrl}/payments/user/${userId}`
    );
  }
}
