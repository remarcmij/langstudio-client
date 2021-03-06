import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { ContentApiService } from '../services/content-api.service'
import { Article } from './article.model'

@Injectable()
export class ArticleResolverService implements Resolve<Article> {

  constructor(
    private api: ContentApiService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Article> | Promise<Article> | Article {
    return this.api.getArticle(route.params['publication'], route.params['chapter'])
  }

}
