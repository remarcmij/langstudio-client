import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { AuthService, User } from '../../core'
import { LibraryService } from '../library.service'
import { LibraryHttpService } from '../library-http.service'
import { Topic } from '../../shared'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { AppConstants } from '../../app.constants'

const scrollTopName = 'library'

@Component({
    selector: 'ls-library',
    templateUrl: 'library.component.html',
    styles: []
})
export class LibraryComponent implements OnInit, OnDestroy, CanComponentDeactivate {

    sidepanel: { isopen: boolean } = { isopen: false }
    user: User | undefined
    topics: Topic[]
    scrollState = 'busy'
    readonly appTitle = AppConstants.appTitle

    private combinedSubscription = new Subscription()

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private libraryService: LibraryService,
        private httpService: LibraryHttpService,
        private navigationService: NavigationService
    ) {
    }

    ngOnInit(): void {
        let subscription = this.navigationService.popTopEmitter
            .subscribe((scrollState: string) => this.scrollState = scrollState)
        this.combinedSubscription.add(subscription)

        subscription = this.authService.getUser()
            .mergeMap(user => {
                this.user = user
                return this.getTopics()
            }).subscribe(() => { }, err => this.httpErrorHandler(err))
        this.combinedSubscription.add(subscription)

        subscription = this.libraryService.handleKeyUp(() => this.search())
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }

    canDeactivate(): boolean {
        this.navigationService.saveTop(scrollTopName)
        return true
    }

    signOut(): void {
        this.sidepanel.isopen = false
        this.authService.signOut()
        this.user = undefined
        this.httpService.clearCache()
        let subscription = this.getTopics()
            .subscribe(() => { }, err => this.httpErrorHandler(err))
        this.combinedSubscription.add(subscription)
    }

    clearCacheNavigate(commands: string[]): void {
        this.httpService.clearCache()
        this.router.navigate(commands)
    }

    openSidePanel(ev: MouseEvent): void {
        ev.stopPropagation()
        this.sidepanel.isopen = true
    }

    search(): void {
        this.router.navigate(['/dictionary', AppConstants.foreignLang, AppConstants.baseLang])
    }

    private getTopics(): Observable<Topic[]> {

        function makeSortKey(topic: Topic): string {
            switch (topic.publication) {
                case 'front':
                    return '0' + topic.title
                case 'back':
                    return '2' + topic.title
                default:
                    return '1' + topic.title
            }
        }

        return this.httpService.getPublications()
            .map(topics => topics.sort((a, b) => makeSortKey(a).localeCompare(makeSortKey(b))))
            .do((topics: Topic[]) => {
                this.topics = topics
                this.navigationService.restoreTop(scrollTopName)
            })
    }

    private httpErrorHandler(err: Response): void {
        window.alert(`Network Error: ${err.statusText}`)
    }
}
