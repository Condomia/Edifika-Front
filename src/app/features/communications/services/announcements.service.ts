import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { Announcement } from '../model/announcement.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsService extends BaseService<Announcement> {
  constructor() {
    super();
    this.resourceEndpoint = environment.announcementEndpointPath;
  }
}
