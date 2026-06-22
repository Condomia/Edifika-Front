import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { CommonAreaRule } from '../model/common-area-rule.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonAreaRulesService extends BaseService<CommonAreaRule> {
  override http = inject(HttpClient);
  override serverBaseUrl = environment.serverBaseUrl;

  constructor() {
    super();
    this.resourceEndpoint = environment.commonAreaRulesEndpointPath;
  }

  getByCommonAreaId(commonAreaId: number): Observable<CommonAreaRule[]> {
    return this.http.get<CommonAreaRule[]>(
      `${this.serverBaseUrl}${environment.commonAreaRulesEndpointPath}?commonAreaId=${commonAreaId}`
    );
  }
}
