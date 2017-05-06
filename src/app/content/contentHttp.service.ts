import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'
import * as LRU from 'lru-cache'

import { Topic } from '../shared'
import { Article, HashTagItem } from './article/article.model'
import { AppConstants } from '../app.constants'
import { AuthService } from '../core'

@Injectable()
export class ContentHttpService {

  private readonly topicCache = LRU<Topic[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private readonly hashTagCache = LRU<HashTagItem[]>({ max: 100, maxAge: 1000 * 60 * 60 })
  private allTags: any[]

  private get auth(): string {
    return this.authService.isTokenValid() ? 'authed' : 'public'
  }

  constructor(
    private http: Http,
    private authHttp: AuthHttp,
    private authService: AuthService
  ) { }

  getPublications(): Observable<Topic[]> {
    const url = `${AppConstants.apiEndPoint}/api/topics/${this.auth}`

    const topics = this.topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    return this.httpGet(url)
      .map(res => <Topic[]>res.json())
      .do(topics => this.topicCache.set(url, topics))
  }

  getPublicationTopics(publication: string): Observable<Topic[]> {
    const url = `${AppConstants.apiEndPoint}/api/topics/${this.auth}/${publication}`
    const topics = this.topicCache.get(url)
    if (topics) {
      return Observable.of(topics)
    }
    return this.httpGet(url)
      .map(res => <Topic[]>res.json())
      .do(topics => {
        const indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        topics = topics.map(topic => {
          topic.foreignLang = topic.foreignLang || indexTopic.foreignLang
          topic.baseLang = topic.baseLang || indexTopic.baseLang
          return topic
        })
        this.topicCache.set(url, topics)
      })
  }

  getHashTagItems(hashTagName: string): Observable<HashTagItem[]> {
    const hashTags = this.hashTagCache.get(hashTagName)
    if (hashTags) {
      return Observable.of(hashTags)
    }
    const url = `${AppConstants.apiEndPoint}/api/article/${this.auth}/hashtag/search?q=${hashTagName}`
    return this.httpGet(url)
      .map(res => <HashTagItem[]>res.json())
      .do(hashTags => this.hashTagCache.set(hashTagName, hashTags))
  }

  getAllHashTags(): Observable<any[]> {
    if (this.allTags) {
      return Observable.of(this.allTags)
    }

    const url = `${AppConstants.apiEndPoint}/api/article/${this.auth}/hashtag/all`
    return this.httpGet(url)
      .map(res => <string[]>res.json())
      .do(hashTags => this.allTags = hashTags)
  }

  getArticle(publication: string, chapter: string): Observable<Article> {
    const fileName = `${publication}.${chapter}.md`
    return this.getPublicationTopics(publication)
      .mergeMap(topics => Observable.from(topics))
      .first(topic => topic.fileName === fileName)
      .mergeMap(topic => {
        const url = `${AppConstants.apiEndPoint}/api/article/${this.auth}/get/${fileName}/${topic.hash}`
        return this.httpGet(url)
          .map(res => <Article>res.json())
          .do(article => {
            article.foreignLang = topic.foreignLang
            article.baseLang = topic.baseLang
          })
      })
  }

  clearCache(): void {
    this.topicCache.reset()
    this.allTags = undefined
  }

  httpGet(url: string): Observable<Response> {
    const httpProvider = this.authService.isTokenValid() ? this.authHttp : this.http
    return httpProvider.get(url)
  }

}
