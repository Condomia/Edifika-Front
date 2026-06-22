import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { User } from '../model/user.model';
import {environment} from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseService<User> {

  constructor() {
    super();
    this.resourceEndpoint = environment.userEndpointPath;
  }
}
