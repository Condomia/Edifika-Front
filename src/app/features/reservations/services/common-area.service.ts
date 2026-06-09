import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base.service';
import { CommonArea } from '../model/common-area.model';

@Injectable({
  providedIn: 'root',
})
export class CommonAreaService extends BaseService<CommonArea> {

  constructor() {
    super();
    this.resourceEndpoint = '/commonAreas';
  }
}
