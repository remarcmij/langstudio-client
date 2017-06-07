import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Http } from '@angular/http'
import * as LRU from 'lru-cache'

import { Topic } from '../../shared'
import { HttpHelperService } from '../../core/http-helper.service'
import { environment } from '../../../environments/environment'

@Injectable()
export class AdminContentApi {

  private readonly _cache = LRU<Topic[]>({ max: 500, maxAge: 1000 * 60 * 60 })

  constructor(
    private _http: Http,
    private _httpHelper: HttpHelperService
  ) { }

  getTopics(): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/admin`
    const topics = this._cache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    const options = this._httpHelper.getRequestOptions()
    return this._http.get(url, options)
      .map(response => <Topic[]>response.json())
      .do(data => this._cache.set(url, data))
  }

  deleteTopic(fileName: string): Observable<boolean> {
    const url = `${environment.api.host}${environment.api.path}/topics/admin/${fileName}`
    const options = this._httpHelper.getRequestOptions()
    return this._http.delete(url, options)
      .map(response => response.ok)
      .do(() => this.clearCache())
  }

  clearCache() {
    this._cache.reset()
  }
}
