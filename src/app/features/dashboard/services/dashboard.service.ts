import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private serverBaseUrl = environment.serverBaseUrl;

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverBaseUrl}/posts`);
  }

  getDebts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverBaseUrl}/debts`);
  }

  getPayments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverBaseUrl}/payments`);
  }

  getUnitsByBuilding(buildingId: number | string): Observable<any[]> {
    const params = new HttpParams()
      .set('buildingId', String(buildingId));

    return this.http.get<any[]>(
      `${this.serverBaseUrl}/units`,
      { params }
    );
  }
}
