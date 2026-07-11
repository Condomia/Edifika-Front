import { Injectable } from '@angular/core';
import { Observable, catchError, retry } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { User } from '../model/user.model';
import { UpdateUserResource } from '../model/update-user-resource.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseService<User> {

  constructor() {
    super();
    this.resourceEndpoint = environment.userEndpointPath;
  }

  updateUser(
    id: number | string,
    resource: UpdateUserResource
  ): Observable<User> {
    return this.http.put<User>(
      `${this.resourcePath()}/${id}`,
      resource,
      this.httpOptions
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
