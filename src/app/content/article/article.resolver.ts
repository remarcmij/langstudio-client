import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { ContentHttp } from '../content-http.service'
import { Article, AnchorInfo } from './article.model'

@Injectable()
export class ArticleResolver implements Resolve<Article> {

  constructor(
    private httpService: ContentHttp
  ) {
    this.httpService = httpService
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Article> | Promise<Article> | Article {
    return this.httpService.getArticle(route.params['publication'], route.params['chapter'])
  }

}
