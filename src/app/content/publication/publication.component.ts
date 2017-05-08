import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { Topic } from '../../shared'
import { ContentService } from '../content.service'
import { ContentHttp } from '../content-http.service'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'

const scrollTopName = 'publication'

@Component({
  selector: 'my-publication',
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
    private _contentService: ContentService,
    private _contentHttp: ContentHttp,
    private _navigationService: NavigationService
  ) {
  }

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
        this._navigationService.restoreTop(scrollTopName)
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })

    this._contentService.handleKeyUp(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  canDeactivate(): boolean {
    this._navigationService.saveTop(scrollTopName)
    return true
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
      case 'search':
        this._router.navigate(['/dictionary', this.indexTopic.foreignLang, this.indexTopic.baseLang])
        break
    }
  }

  openArticle(topic: Topic) {
    this._navigationService.clearTop('article')
    this._router.navigate(['/library', topic.publication, topic.chapter])
  }

}
