import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { UserUnit } from '../model/user-unit.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserUnitsService extends BaseService<UserUnit> {
  override http = inject(HttpClient);
  override serverBaseUrl = environment.serverBaseUrl;

  constructor() {
    super();
    this.resourceEndpoint = environment.userUnitEndpointPath;
  }

  moveUserToUnit(idUser: number, newIdUnit: number, moveDate: string): Observable<UserUnit> {
    return this.http.put<UserUnit>(
      `${this.serverBaseUrl}${environment.userUnitEndpointPath}/move`,
      {
        idUser,
        newIdUnit,
        moveDate
      }
    );
  }
}
