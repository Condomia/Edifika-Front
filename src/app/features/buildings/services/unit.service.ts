import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Unit } from '../model/unit.model';

@Injectable({
  providedIn: 'root'
})
export class UnitService extends BaseService<Unit> {
  override resourceEndpoint = 'units';
}
