import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { environment } from '../../../../environments/environment';

import { Building } from '../model/building.model';
import { CreateBuildingResource } from '../model/create-building-resource.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService extends BaseService<Building> {

  constructor() {
    super();
    this.resourceEndpoint = environment.buildingEndpointPath;
  }

  createBuilding(
    resource: CreateBuildingResource
  ): Observable<Building> {
    return this.http.post<Building>(
      this.resourcePath(),
      resource,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }
}
