import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { Topic } from '../../shared'
import { ContentApiService } from '../services/content-api.service'
import { ContentService } from '../services/content.service'
import { LanguageService } from '../services/language.service'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'

const SELECTOR = 'publication'

@Component({
  templateUrl: './publication.component.html'
})
export class PublicationComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  publication: string
  indexTopic: Topic
  topics: Topic[]
  scrollState = 'busy'
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _content: ContentService,
    private _contentApi: ContentApiService,
    private _language: LanguageService,
    private _navigation: NavigationService
  ) {
  }

  ngOnInit() {
    this._navigation.scrollState
      .takeUntil(this._ngUnsubscribe)
      .subscribe(state => this.scrollState = state)

    this.publication = this._route.snapshot.params['publication']
    this._contentApi.getPublicationTopics(this.publication)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(topics => {
        this.indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        this._language.baseLang = this.indexTopic.baseLang
        this._language.targetLang = this.indexTopic.foreignLang
        this.topics = topics.filter(topic => topic.chapter !== 'index')
        this._navigation.restoreTop(SELECTOR)
      }, err => window.alert(`Error: ${err}`))

    this._content.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigation.saveTop(SELECTOR)
    return true
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
      case 'search':
        this._router.navigate(['/search/dict'])
        break
    }
  }

  openArticle(topic: Topic) {
    this._navigation.clearTop('article')
    this._router.navigate(['/library', topic.publication, topic.chapter])
  }

}
