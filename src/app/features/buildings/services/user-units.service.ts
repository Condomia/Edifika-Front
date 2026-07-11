import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { environment } from '../../../../environments/environment';

import { UserUnit } from '../model/user-unit.model';
import { CreateUserUnitResource } from '../model/create-user-unit-resource.model';

@Injectable({
  providedIn: 'root'
})
export class UserUnitsService extends BaseService<UserUnit> {

  constructor() {
    super();
    this.resourceEndpoint = environment.userUnitEndpointPath;
  }

  assignUserToUnit(
    resource: CreateUserUnitResource
  ): Observable<UserUnit> {
    return this.http.post<UserUnit>(
      this.resourcePath(),
      resource,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  getByBuildingId(
    idBuilding: number
  ): Observable<UserUnit[]> {
    const baseUrl =
      this.serverBaseUrl.replace(/\/+$/, '');

    const buildingsPath =
      environment.buildingEndpointPath.replace(/^\/+/, '');

    return this.http.get<UserUnit[]>(
      `${baseUrl}/${buildingsPath}/${idBuilding}/residents`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
