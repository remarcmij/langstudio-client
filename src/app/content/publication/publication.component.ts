import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { Topic } from '../../shared'
import { ContentHttp } from '../content-http.service'
import { Navigation } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { CoreUtil} from '../../core'

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
    private _coreUtil: CoreUtil,
    private _contentHttp: ContentHttp,
    private _navigationService: Navigation
  ) { }

  ngOnInit() {
    this._navigationService.popTopEmitter
      .takeUntil(this._ngUnsubscribe)
      .subscribe((scrollState: string) => this.scrollState = scrollState)

    this.publication = this._route.snapshot.params['publication']
    this._contentHttp.getPublicationTopics(this.publication)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(topics => {
        this.indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        this.topics = topics.filter(topic => topic.chapter !== 'index')
        this._navigationService.restoreTop(SELECTOR)
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })

    this._coreUtil.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigationService.saveTop(SELECTOR)
    return true
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
      case 'search':
        this._router.navigate(['/search/dict', { target: this.indexTopic.foreignLang, base: this.indexTopic.baseLang}])
        break
    }
  }

  openArticle(topic: Topic) {
    this._navigationService.clearTop('article')
    this._router.navigate(['/library', topic.publication, topic.chapter])
  }

}
