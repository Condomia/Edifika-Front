import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { Unit } from '../model/unit.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitsService extends BaseService<Unit> {
  constructor() {
    super();
    this.resourceEndpoint = environment.unitEndpointPath;
  }
}
