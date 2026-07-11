import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HttpParams } from '@angular/common/http';

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

  getByBuildingId(buildingId: number): Observable<Announcement[]> {
    const params = new HttpParams().set('buildingId', buildingId);

    return this.http.get<Announcement[]>(
      this.resourcePath(),
      { ...this.httpOptions, params }
    ).pipe(
      catchError(this.handleError)
    );
  }
}
