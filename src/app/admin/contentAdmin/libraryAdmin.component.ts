import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { ModalDirective } from 'ngx-bootstrap'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/toPromise'

import { ContentAdminHttpService } from './contentAdminHttp.service'
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
    private httpService: ContentAdminHttpService
  ) { }

  ngOnInit(): void {
    const sub$ = this.getTopics()
      .subscribe(topics => this.topics = topics)
    this.subscriptions$.push(sub$)
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach(sub$ => sub$.unsubscribe())
  }

  confirmRemoval(publication: string): void {
    if (window.confirm(`Remove publication ${publication}?`)) {
      this.publicationToRemove = publication
      this.removePublication()
    }
  }

  removePublication(): void {
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

  showConfirmationModal(): void {
    this.confirmationModal.show()
  }

  hideConfirmationModal(): void {
    this.confirmationModal.hide()
  }

  private getTopics(): Observable<Topic[]> {
    return this.httpService.getTopics()
      .map(topics => topics.filter(topic => topic.type === 'article'))
  }
}
