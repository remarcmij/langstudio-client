import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'
import * as LRU from 'lru-cache'

import { Topic } from '../../shared'
import { AppConstants } from '../../app.constants'

@Injectable()
export class ContentAdminHttpService {

  private readonly cache = LRU<Topic[]>({ max: 500, maxAge: 1000 * 60 * 60 })

  constructor(
    private authHttp: AuthHttp
  ) { }

  getTopics(): Observable<Topic[]> {
    const url = `${AppConstants.API_END_POINT}/api/topics/admin`
    const topics = this.cache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    return this.authHttp.get(url)
      .map(response => response.json())
      .do((data: Topic[]) => this.cache.set(url, data))
  }

  removeTopic(fileName: string): Observable<boolean> {
    const url = `${AppConstants.API_END_POINT}/api/topics/admin/${fileName}`
    return this.authHttp.delete(url)
      .map(response => response.ok)
      .do(() => this.clearCache())
  }

  clearCache(): void {
    this.cache.reset()
  }
}
