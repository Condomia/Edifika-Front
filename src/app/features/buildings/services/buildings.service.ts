import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Building } from '../model/building.model';

@Injectable({
  providedIn: 'root'
})
export class BuildingsService extends BaseService<Building> {
  constructor() {
    super();
    this.resourceEndpoint = '/buildings';
  }
}
