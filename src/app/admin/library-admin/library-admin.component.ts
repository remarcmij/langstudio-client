import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { ModalDirective } from 'ng2-bootstrap'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { LibraryAdminHttpService } from './library-admin-http.service'
import { Topic } from '../../shared'

@Component({
    selector: 'ls-library-admin',
    templateUrl: './library-admin.component.html',
    styles: []
})
export class LibraryAdminComponent implements OnInit, OnDestroy {

    @ViewChild('confirmationModal') confirmationModal: ModalDirective
    topics: Topic[] = []
    publicationToRemove: string
    get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

    private combinedSubscription = new Subscription()

    constructor(
        private httpService: LibraryAdminHttpService
    ) { }

    ngOnInit(): void {
        let subscription = this.getTopics()
            .subscribe(topics => this.topics = topics)
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy() {
        this.combinedSubscription.unsubscribe()
    }

    confirmRemoval(publication: string): void {
        if (window.confirm(`Remove publication ${publication}?`)) {
            this.publicationToRemove = publication
            this.removePublication()
        }

        // this.publicationToRemove = publication
        // this.showConfirmationModal()
    }

    removePublication(): void {
        // this.confirmationModal.hide()

        let subscription = Observable.from(this.topics)
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
        this.combinedSubscription.add(subscription)
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
