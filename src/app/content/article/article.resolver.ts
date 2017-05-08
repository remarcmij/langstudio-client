import { Injectable } from '@angular/core'
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { ContentHttp } from '../content-http.service'
import { Article } from './article.model'

@Injectable()
export class ArticleResolver implements Resolve<Article> {

  constructor(
    private _contentHttp: ContentHttp
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Article> | Promise<Article> | Article {
    return this._contentHttp.getArticle(route.params['publication'], route.params['chapter'])
  }

}
