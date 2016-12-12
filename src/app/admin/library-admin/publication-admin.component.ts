import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ModalDirective } from 'ng2-bootstrap'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { LibraryAdminHttpService } from './library-admin-http.service'
import { Topic } from '../../shared'

@Component({
    selector: 'ls-publication-admin',
    templateUrl: './publication-admin.component.html',
    styles: []
})
export class PublicationManagerComponent implements OnInit, OnDestroy {

    @ViewChild('confirmationModal') confirmationModal: ModalDirective
    publication: string
    topics: Topic[] = []
    topicToRemove: Topic
    get indexTopics() { return this.topics.filter(topic => topic.chapter === 'index') }

    private combinedSubscription = new Subscription()

    constructor(
        private activatedRoute: ActivatedRoute,
        private httpService: LibraryAdminHttpService
    ) {
    }

    ngOnInit(): void {
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

    confirmRemoval(topic: Topic): void {
        if (window.confirm(`Remove publication ${topic.title}?`)) {
            this.topicToRemove = topic
            this.removeArticle()
        }

        // this.topicToRemove = topic
        // this.showConfirmationModal()
    }

    removeArticle(): void {
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

    showConfirmationModal(): void {
        this.confirmationModal.show()
    }

    hideConfirmationModal(): void {
        this.confirmationModal.hide()
    }

    private getTopics(): Observable<Topic[]> {
        return this.httpService.getTopics()
            .map(topics => topics.filter(topic => topic.publication === this.publication && topic.chapter !== 'index'))
    }
}
