import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

import { BaseService } from '../../../shared/services/base.service';
import { Post } from '../model/post.model';
import { environment } from '../../../../environments/environment';

interface PageResponse<T> {
  content: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PostsService extends BaseService<Post> {
  constructor() {
    super();
    this.resourceEndpoint = environment.postEndpointPath;
  }

  override getAll(): Observable<Post[]> {
    return this.http
      .get<PageResponse<Post>>(this.resourcePath(), this.httpOptions)
      .pipe(
        map(response => response.content ?? []),
        catchError(this.handleError)
      );
  }
}
