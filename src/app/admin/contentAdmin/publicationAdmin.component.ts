import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ModalDirective } from 'ngx-bootstrap'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { ContentAdminHttp } from './contentAdminHttp.service'
import { Topic } from '../../shared'

@Component({
  selector: 'my-publication-admin',
  templateUrl: './publicationAdmin.component.html',
  styles: []
})
export class PublicationAdminComponent implements OnInit, OnDestroy {

  @ViewChild('confirmationModal') confirmationModal: ModalDirective
  publication: string
  topics: Topic[] = []
  topicToRemove: Topic
  get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

  private combinedSubscription = new Subscription()

  constructor(
    private activatedRoute: ActivatedRoute,
    private httpService: ContentAdminHttp
  ) {
  }

  ngOnInit() {
    let subscription = this.activatedRoute.params
      .mergeMap(params => {
        this.publication = params['publication']
        return this.getTopics()
      }).subscribe(topics => {
        this.topics = topics
      })
    this.combinedSubscription.add(subscription)
  }

  ngOnDestroy() {
    this.combinedSubscription.unsubscribe()
  }

  confirmRemoval(topic: Topic) {
    if (window.confirm(`Remove publication ${topic.title}?`)) {
      this.topicToRemove = topic
      this.removeArticle()
    }

    // this.topicToRemove = topic
    // this.showConfirmationModal()
  }

  removeArticle() {
    // this.confirmationModal.hide()
    let subscription = this.httpService.removeTopic(this.topicToRemove.fileName)
      .mergeMap(() => {
        return this.getTopics()
      })
      .subscribe(topics => {
        this.topics = topics
      }, () => {
        this.getTopics()
      }, () => {
        window.alert('An error occurred while attempting to remove the article.')
      })
    this.combinedSubscription.add(subscription)
  }

  showConfirmationModal() {
    this.confirmationModal.show()
  }

  hideConfirmationModal() {
    this.confirmationModal.hide()
  }

  private getTopics(): Observable<Topic[]> {
    return this.httpService.getTopics()
      .map(topics => topics.filter(topic => topic.publication === this.publication && topic.chapter !== 'index'))
  }
}
