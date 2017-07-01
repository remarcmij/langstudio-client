import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import * as LRU from 'lru-cache'

import { Topic } from '../../shared'
import { Article, HashTagItem } from '../article/article.model'
import { AuthService } from '../../core'
import { HttpHelperService } from '../../core/http-helper.service'
import { environment } from '../../../environments/environment'

@Injectable()
export class ContentApiService {

  private readonly _topicCache = LRU<Topic[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private readonly _hashTagCache = LRU<HashTagItem[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private _allTags: any[]

  constructor(
    private http: Http,
    private httpHelper: HttpHelperService,
    private auth: AuthService
  ) {
  }

  getPublications(): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/index`
    const topics = this._topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    const options = this.httpHelper.getRequestOptions()
    return this.http.get(url, options)
      .map(res => <Topic[]>res.json())
      .do(topics => this._topicCache.set(url, topics))
      .catch(this.httpHelper.handleError)
  }

  getPublicationTopics(publication: string): Observable<Topic[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/publication/${publication}`
    const topics = this._topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }

    const options = this.httpHelper.getRequestOptions()

    return this.http.get(url, options)
      .map(res => <Topic[]>res.json())
      .do(topics => {
        const indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        topics = topics.map(topic => {
          topic.targetLang = topic.targetLang || indexTopic.targetLang
          topic.baseLang = topic.baseLang || indexTopic.baseLang
          return topic
        })
        this._topicCache.set(url, topics)
      })
      .catch(this.httpHelper.handleError)
  }

  getHashTagItems(hashTagName: string): Observable<HashTagItem[]> {
    const hashTags = this._hashTagCache.get(hashTagName)
    if (hashTags) {
      return Observable.of(hashTags)
    }

    const url = `${environment.api.host}${environment.api.path}/article/hashtag/search?q=${hashTagName}`

    return this.http.get(url)
      .map(res => <HashTagItem[]>res.json())
      .do(hashTags => this._hashTagCache.set(hashTagName, hashTags))
      .catch(this.httpHelper.handleError)

  }

  getAllHashTags(): Observable<any[]> {
    if (this._allTags) {
      return Observable.of(this._allTags)
    }

    const url = `${environment.api.host}${environment.api.path}/article/hashtag/all`

    return this.http.get(url)
      .map(res => <string[]>res.json())
      .do(hashTags => this._allTags = hashTags)
      .catch(this.httpHelper.handleError)
  }

  getArticle(publication: string, chapter: string): Observable<Article> {
    const fileName = `${publication}.${chapter}.md`
    return this.getPublicationTopics(publication)
      .mergeMap(topics => Observable.from(topics))
      .first(topic => topic.fileName === fileName)
      .mergeMap(topic => {
        const url = `${environment.api.host}${environment.api.path}/article/${fileName}`
        const options = this.httpHelper.getRequestOptions()
        return this.http.get(url, options)
          .map(res => <Article>res.json())
          .do(article => {
            article.targetLang = topic.targetLang
            article.baseLang = topic.baseLang
          })
      })
      .catch(this.httpHelper.handleError)
  }

  clearCache() {
    this._topicCache.reset()
    this._allTags = undefined
  }
}
