import { Injectable } from '@angular/core';

import { BaseService } from '../../../shared/services/base.service';
import { Post } from '../model/post.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService extends BaseService<Post> {
  constructor() {
    super();
    this.resourceEndpoint = environment.postEndpointPath;
  }
}
