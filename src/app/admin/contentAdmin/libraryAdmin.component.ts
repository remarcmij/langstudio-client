import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { ModalDirective } from 'ngx-bootstrap'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { ContentAdminHttp } from './contentAdminHttp.service'
import { Topic } from '../../shared'

@Component({
  selector: 'my-library-admin',
  templateUrl: './libraryAdmin.component.html',
  styles: []
})
export class LibraryAdminComponent implements OnInit, OnDestroy {

  @ViewChild('confirmationModal') confirmationModal: ModalDirective
  topics: Topic[] = []
  publicationToRemove: string
  subscriptions$: Subscription[] = []
  get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

  constructor(
    private httpService: ContentAdminHttp
  ) { }

  ngOnInit() {
    const sub$ = this.getTopics()
      .subscribe(topics => this.topics = topics)
    this.subscriptions$.push(sub$)
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(sub$ => sub$.unsubscribe())
  }

  confirmRemoval(publication: string) {
    if (window.confirm(`Remove publication ${publication}?`)) {
      this.publicationToRemove = publication
      this.removePublication()
    }
  }

  removePublication() {
    const sub$ = Observable.from(this.topics)
      .filter(topic => topic.publication === this.publicationToRemove)
      .map(topic => this.httpService.removeTopic(topic.fileName))
      .mergeAll(4)
      .subscribe(success => {
        if (success) {
          this.getTopics()
        } else {
          window.alert('An error occurred while attempting to remove the publication.')
        }
      }, () => {
        window.alert('An error occurred while attempting to remove the publication.')
      })
    this.subscriptions$.push(sub$)
  }

  showConfirmationModal() {
    this.confirmationModal.show()
  }

  hideConfirmationModal() {
    this.confirmationModal.hide()
  }

  private getTopics(): Observable<Topic[]> {
    return this.httpService.getTopics()
      .map(topics => topics.filter(topic => topic.type === 'article'))
  }
}
