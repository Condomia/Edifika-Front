import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { CommonArea } from '../model/common-area.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonAreaService extends BaseService<CommonArea> {
  constructor() {
    super();
    this.resourceEndpoint = environment.commonAreaEndpointPath;
  }
}
