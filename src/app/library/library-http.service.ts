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
export class LibraryHttpService {

    private readonly topicCache = LRU<Topic[]>({ max: 100, maxAge: 1000 * 60 * 60 })
    private readonly hashTagCache = LRU<HashTagItem[]>({ max: 100, maxAge: 1000 * 60 * 60 })
    private allTags: any[]

    constructor(
        private http: Http,
        private authHttp: AuthHttp,
        private authService: AuthService
    ) {
    }

    getPublications(): Observable<Topic[]> {
        let {httpProvider, auth} = this.getProviderDetails()
        let url = `${AppConstants.apiEndPoint}/api/topics/${auth}`
        let topics = this.topicCache.get(url)
        if (topics) {
            return Observable.of(topics)
        }

        return httpProvider.get(url)
            .map((res: Response) => res.json())
            .do((resTopics: Topic[]) => this.topicCache.set(url, resTopics))
    }

    getPublicationTopics(publication: string): Observable<Topic[]> {
        let {httpProvider, auth} = this.getProviderDetails()
        let url = `${AppConstants.apiEndPoint}/api/topics/${auth}/${publication}`
        let cachedTopics = this.topicCache.get(url)
        if (cachedTopics) {
            return Observable.of(cachedTopics)
        }
        return httpProvider.get(url)
            .map((res: Response) => res.json())
            .do((topics: Topic[]) => {
                let indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
                topics = topics.map(topic => {
                    topic.foreignLang = topic.foreignLang || indexTopic.foreignLang
                    topic.baseLang = topic.baseLang || indexTopic.baseLang
                    return topic
                })
                this.topicCache.set(url, topics)
            })
    }

    getHashTagItems(hashTag: string): Observable<HashTagItem[]> {
        let cachedHashTags = this.hashTagCache.get(hashTag)
        if (cachedHashTags) {
            return Observable.of(cachedHashTags)
        }
        let {httpProvider, auth} = this.getProviderDetails()
        let url = `${AppConstants.apiEndPoint}/api/article/authed/hashtag/search?q=${hashTag}`
        return httpProvider.get(url)
            .map((res: Response) => res.json())
            .do((items: HashTagItem[]) => this.hashTagCache.set(hashTag, items))
    }

    getAllHashTags(): Observable<any[]> {
        if (this.allTags) {
            return Observable.of(this.allTags)
        }

        let {httpProvider, auth} = this.getProviderDetails()
        let url = `${AppConstants.apiEndPoint}/api/article/authed/hashtag/all`
        return httpProvider.get(url)
            .map((res: Response) => res.json())
            .do((tags: string[]) => this.allTags = tags)
    }

    getArticle(publication: string, chapter: string): Observable<Article> {
        let {httpProvider, auth} = this.getProviderDetails()
        let fileName = `${publication}.${chapter}.md`
        return this.getPublicationTopics(publication)
            .mergeMap(topics => Observable.from(topics))
            .first(topic => topic.fileName === fileName)
            .mergeMap((topic: Topic): Observable<Article> => {
                let url = `${AppConstants.apiEndPoint}/api/article/${auth}/get/${fileName}/${topic.hash}`
                return httpProvider.get(url)
                    .map((res: Response) => res.json())
                    .do((article: Article) => {
                        article.foreignLang = topic.foreignLang
                        article.baseLang = topic.baseLang
                    })
            })
    }

    clearCache(): void {
        this.topicCache.reset()
        this.allTags = undefined
    }

    private getProviderDetails(): { httpProvider: any, auth: string } {
        if (this.authService.isTokenValid()) {
            return { httpProvider: this.authHttp, auth: 'authed' }
        } else {
            return { httpProvider: this.http, auth: 'public' }
        }
    }
}
