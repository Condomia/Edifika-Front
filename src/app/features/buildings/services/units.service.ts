import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Unit } from '../model/unit.model';

@Injectable({
  providedIn: 'root'
})
export class UnitsService extends BaseService<Unit> {
  constructor() {
    super();
    this.resourceEndpoint = '/units';
  }
}
