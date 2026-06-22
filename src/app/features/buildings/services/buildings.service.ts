import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { Building } from '../model/building.model';
import { Unit } from '../model/unit.model';
import { UserUnit } from '../model/user-unit.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService extends BaseService<Building> {
  override http = inject(HttpClient);
  override serverBaseUrl = environment.serverBaseUrl;

  constructor() {
    super();
    this.resourceEndpoint = environment.buildingEndpointPath;
  }

  getUnitsByBuildingId(idBuilding: number): Observable<Unit[]> {
    return this.http.get<Unit[]>(
      `${this.serverBaseUrl}${environment.buildingEndpointPath}/${idBuilding}/units`
    );
  }

  getResidentsByBuildingId(idBuilding: number): Observable<UserUnit[]> {
    return this.http.get<UserUnit[]>(
      `${this.serverBaseUrl}${environment.buildingEndpointPath}/${idBuilding}/residents`
    );
  }
}
