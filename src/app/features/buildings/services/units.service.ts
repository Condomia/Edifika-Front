import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { environment } from '../../../../environments/environment';

import { Unit } from '../model/unit.model';
import { CreateUnitResource } from '../model/create-unit-resource.model';
import { UpdateUnitResource } from '../model/update-unit-resource.model';

@Injectable({
  providedIn: 'root'
})
export class UnitsService extends BaseService<Unit> {

  constructor() {
    super();
    this.resourceEndpoint = environment.unitEndpointPath;
  }

  createUnit(resource: CreateUnitResource): Observable<Unit> {
    return this.http.post<Unit>(
      this.resourcePath(),
      resource,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  override update(
    idUnit: number,
    resource: UpdateUnitResource
  ): Observable<Unit> {
    return this.http.put<Unit>(
      this.getUnitUrl(idUnit),
      resource,
      this.httpOptions
    );
  }

  getUnitUrl(idUnit: number): string {
    return `${this.resourcePath()}/${idUnit}`;
  }

  getByBuildingId(idBuilding: number): Observable<Unit[]> {
    const baseUrl = this.serverBaseUrl.replace(/\/+$/, '');

    const buildingsPath =
      environment.buildingEndpointPath.replace(/^\/+/, '');

    return this.http.get<Unit[]>(
      `${baseUrl}/${buildingsPath}/${idBuilding}/units`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
