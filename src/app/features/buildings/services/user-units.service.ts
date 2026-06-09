import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { UserUnit } from '../model/user-unit.model';

@Injectable({
  providedIn: 'root'
})
export class UserUnitsService extends BaseService<UserUnit> {
  constructor() {
    super();
    this.resourceEndpoint = '/userUnits';
  }
}
