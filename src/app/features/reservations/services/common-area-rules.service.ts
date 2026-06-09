import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { CommonAreaRule } from '../model/common-area-rule.model';

@Injectable({
  providedIn: 'root',
})
export class CommonAreaRulesService extends BaseService<CommonAreaRule> {
  constructor() {
    super();
    this.resourceEndpoint = '/commonAreaRules';
  }
}
