import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import * as LRU from 'lru-cache'

import { Topic } from '../shared'
import { Article, HashTagItem } from './article/article.model'
import { AuthService } from '../core'
import { HttpHelper } from '../core'
import { environment } from '../../environments/environment'

@Injectable()
export class ContentApi {

  private readonly _topicCache = LRU<Topic[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private readonly _hashTagCache = LRU<HashTagItem[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private _allTags: any[]

  private get _auth(): string {
    return this._authService.token ? 'auth' : 'pub'
  }

  constructor(
    private _http: Http,
    private _httpHelper: HttpHelper,
    private _authService: AuthService
  ) { }

  getPublications(): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/${this._auth}`
    const topics = this._topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    const options = this._httpHelper.getRequestOptions()
    return this._http.get(url, options)
      .map(res => <Topic[]>res.json())
      .do(topics => this._topicCache.set(url, topics))
  }

  getPublicationTopics(publication: string): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/${this._auth}/${publication}`
    const topics = this._topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    const options = this._httpHelper.getRequestOptions()
    return this._http.get(url, options)
      .map(res => <Topic[]>res.json())
      .do(topics => {
        const indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        topics = topics.map(topic => {
          topic.foreignLang = topic.foreignLang || indexTopic.foreignLang
          topic.baseLang = topic.baseLang || indexTopic.baseLang
          return topic
        })
        this._topicCache.set(url, topics)
      })
  }

  getHashTagItems(hashTagName: string): Observable<HashTagItem[]> {
    const hashTags = this._hashTagCache.get(hashTagName)
    if (hashTags) {
      return Observable.of(hashTags)
    }
    const url = `${environment.api.host}${environment.api.path}/article/${this._auth}/hashtag/search?q=${hashTagName}`
    return this._http.get(url)
      .map(res => <HashTagItem[]>res.json())
      .do(hashTags => this._hashTagCache.set(hashTagName, hashTags))
  }

  getAllHashTags(): Observable<any[]> {
    if (this._allTags) {
      return Observable.of(this._allTags)
    }
    const url = `${environment.api.host}${environment.api.path}/article/${this._auth}/hashtag/all`
    return this._http.get(url)
      .map(res => <string[]>res.json())
      .do(hashTags => this._allTags = hashTags)
  }

  getArticle(publication: string, chapter: string): Observable<Article> {
    const fileName = `${publication}.${chapter}.md`
    return this.getPublicationTopics(publication)
      .mergeMap(topics => Observable.from(topics))
      .first(topic => topic.fileName === fileName)
      .mergeMap(topic => {
        const url = `${environment.api.host}${environment.api.path}/article/${this._auth}/${fileName}/${topic.hash}`
        const options = this._httpHelper.getRequestOptions()
        return this._http.get(url, options)
          .map(res => <Article>res.json())
          .do(article => {
            article.foreignLang = topic.foreignLang
            article.baseLang = topic.baseLang
          })
      })
  }

  clearCache() {
    this._topicCache.reset()
    this._allTags = undefined
  }
}
