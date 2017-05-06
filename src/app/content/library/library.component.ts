import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { AuthService, User } from '../../core'
import { ContentService } from '../content.service'
import { ContentHttpService } from '../contentHttp.service'
import { Topic } from '../../shared'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { AppConstants } from '../../app.constants'

const scrollTopName = 'library'

@Component({
  selector: 'my-library',
  templateUrl: './library.component.html',
  styles: []
})
export class LibraryComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  sidenav = { isOpen: false }
  user: User | undefined
  topics: Topic[]
  scrollState = 'busy'
  readonly title = AppConstants.appTitle
  private subscriptions$: Subscription[] = []

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private libraryService: ContentService,
    private httpService: ContentHttpService,
    private navigationService: NavigationService
  ) { }

  ngOnInit() {
    const sub1$ = this.navigationService.popTopEmitter
      .subscribe((scrollState: string) => this.scrollState = scrollState)
    this.subscriptions$.push(sub1$)

    const sub2$ = this.authService.getUser()
      .mergeMap(user => {
        this.user = user
        return this.getTopics()
      }).subscribe(() => { }, err => this.httpErrorHandler(err))
    this.subscriptions$.push(sub2$)

    const sub3$ = this.libraryService.handleKeyUp(() => this.search())
    this.subscriptions$.push(sub3$)
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(sub$ => sub$.unsubscribe())
  }

  canDeactivate(): boolean {
    this.navigationService.saveTop(scrollTopName)
    return true
  }

  openSidePanel(ev: MouseEvent) {
    ev.stopPropagation()
    this.sidenav.isOpen = true
  }

  search() {
    this.router.navigate(['/dictionary', AppConstants.foreignLang, AppConstants.baseLang])
  }

  onAction(action: string) {
    switch (action) {
      case 'openSidenav':
        this.sidenav.isOpen = true
        break
      case 'signin':
        this.router.navigate(['/signin'])
        break
      case 'signout':
        this.signOut()
        break
      case 'upload':
        this.uploadFiles()
        break
      case 'manageContent':
        this.manageContent()
        break
      case 'manageUsers':
        this.manageUsers()
        break
      case 'search':
        this.router.navigate(['/dictionary', AppConstants.foreignLang, AppConstants.baseLang])
        break
      case 'about':
        this.router.navigate(['/about'])
        break
    }
  }

  signOut() {
    this.sidenav.isOpen = false
    this.authService.signOut()
    this.user = undefined
    this.httpService.clearCache()
    const sub$ = this.getTopics()
      .subscribe(() => { }, err => this.httpErrorHandler(err))
    this.subscriptions$.push(sub$)
  }

  uploadFiles() {
    this.httpService.clearCache()
    this.router.navigate(['/admin', 'upload'])
  }

  manageContent() {
    this.httpService.clearCache()
    this.router.navigate(['/admin', 'library'])
  }

  manageUsers() {
    this.httpService.clearCache()
    this.router.navigate(['/admin', 'user'])
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

  private httpErrorHandler(err: Response) {
    window.alert(`Network Error: ${err.statusText}`)
  }
}
