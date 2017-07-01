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
    private router: Router,
    private route: ActivatedRoute,
    private content: ContentService,
    private api: ContentApiService,
    private language: LanguageService,
    private navigation: NavigationService
  ) {
  }

  ngOnInit() {
    this.navigation.scrollState
      .takeUntil(this._ngUnsubscribe)
      .subscribe(state => this.scrollState = state)

    this.publication = this.route.snapshot.params['publication']
    this.api.getPublicationTopics(this.publication)
      .subscribe(topics => {
        this.indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        this.language.baseLang = this.indexTopic.baseLang
        this.language.targetLang = this.indexTopic.targetLang
        this.topics = topics.filter(topic => topic.chapter !== 'index')
        this.navigation.restoreTop(SELECTOR)
      }, err => window.alert(`Error: ${err}`))

    this.content.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this.navigation.saveTop(SELECTOR)
    return true
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
      case 'search':
        this.router.navigate(['/search/dict'])
        break
    }
  }

  openArticle(topic: Topic) {
    this.navigation.clearTop('article')
    this.router.navigate(['/library', topic.publication, topic.chapter])
  }

}
