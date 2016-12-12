import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'

import { Topic } from '../../shared'
import { LibraryService } from '../library.service'
import { LibraryHttpService } from '../library-http.service'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'

const scrollTopName = 'publication'

@Component({
    selector: 'ls-publication',
    templateUrl: 'publication.component.html'
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
        private libraryService: LibraryService,
        private httpService: LibraryHttpService,
        private navigationService: NavigationService
    ) {
    }

    ngOnInit(): void {
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

        subscription = this.libraryService.handleKeyUp(() => this.commandHandler('search'))
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }

    canDeactivate(): boolean {
        this.navigationService.saveTop(scrollTopName)
        return true
    }

    commandHandler(command: string): void {

        switch (command) {
            case 'search':
                this.router.navigate(['/dictionary', this.indexTopic.foreignLang, this.indexTopic.baseLang])
                break

            case 'allTags':
                this.router.navigate(['/hashtag'])
                break

            default:
                console.error(`unknown command: ${command}`)
        }
    }
}
