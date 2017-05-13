import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'
import * as LRU from 'lru-cache'

import { Topic } from '../../shared'
import { environment } from '../../../environments/environment'

@Injectable()
export class AdminContentHttp {

  private readonly _cache = LRU<Topic[]>({ max: 500, maxAge: 1000 * 60 * 60 })

  constructor(
    private authHttp: AuthHttp
  ) { }

  getTopics(): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/admin`
    const topics = this._cache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    return this.authHttp.get(url)
      .map(response => <Topic[]>response.json())
      .do(data => this._cache.set(url, data))
  }

  deleteTopic(fileName: string): Observable<boolean> {
    const url = `${environment.api.host}${environment.api.path}/topics/admin/${fileName}`
    return this.authHttp.delete(url)
      .map(response => response.ok)
      .do(() => this.clearCache())
  }

  clearCache() {
    this._cache.reset()
  }
}
