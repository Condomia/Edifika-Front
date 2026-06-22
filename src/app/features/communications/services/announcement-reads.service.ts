import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { AnnouncementRead } from '../model/announcement-read.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementReadsService extends BaseService<AnnouncementRead> {
  constructor() {
    super();
    this.resourceEndpoint = environment.announcementReadEndpointPath;
  }
}
