import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'

import { Topic } from '../../shared'
import { ContentService } from '../content.service'
import { ContentHttpService } from '../contentHttp.service'
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
  private combinedSubscription = new Subscription()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private libraryService: ContentService,
    private httpService: ContentHttpService,
    private navigationService: NavigationService
  ) {
  }

  ngOnInit() {
    let subscription = this.navigationService.popTopEmitter
      .subscribe((scrollState: string) => this.scrollState = scrollState)
    this.combinedSubscription.add(subscription)

    this.publication = this.route.snapshot.params['publication']
    subscription = this.httpService.getPublicationTopics(this.publication)
      .subscribe(topics => {
        this.indexTopic = topics.filter(topic => topic.chapter === 'index')[0]
        this.topics = topics.filter(topic => topic.chapter !== 'index')
        this.navigationService.restoreTop(scrollTopName)
      }, (err: Response) => {
        if (err.status === 401) {
          this.router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })
    this.combinedSubscription.add(subscription)

    subscription = this.libraryService.handleKeyUp(() => this.onAction('search'))
    this.combinedSubscription.add(subscription)
  }

  ngOnDestroy() {
    this.combinedSubscription.unsubscribe()
  }

  canDeactivate(): boolean {
    this.navigationService.saveTop(scrollTopName)
    return true
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
      case 'search':
        this.router.navigate(['/dictionary', this.indexTopic.foreignLang, this.indexTopic.baseLang])
        break
    }
  }

  openArticle(topic: Topic) {
    this.navigationService.clearTop('article')
    this.router.navigate(['/library', topic.publication, topic.chapter])
  }

}
