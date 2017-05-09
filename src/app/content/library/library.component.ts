import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { AuthService, User } from '../../core'
import { ContentHttp } from '../content-http.service'
import { CoreUtil } from '../../core'
import { Topic } from '../../shared'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { AppConstants } from '../../app.constants'

const SELECTOR = 'my-library'

@Component({
  selector: SELECTOR,
  templateUrl: './library.component.html',
  styles: []
})
export class LibraryComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  sidenav = { isOpen: false }
  user: User | undefined
  topics: Topic[]
  scrollState = 'busy'
  readonly title = AppConstants.APP_TITLE
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _coreUtil: CoreUtil,
    private _authService: AuthService,
    private _contentService: ContentHttp,
    private _navigationService: NavigationService
  ) { }

  ngOnInit() {
    this._navigationService.popTopEmitter
      .takeUntil(this._ngUnsubscribe)
      .subscribe((scrollState: string) => this.scrollState = scrollState)

    this._authService.getUser()
      .do(user => this.user = user)
      .mergeMap(() => this._getTopics())
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => { }, err => this._httpErrorHandler(err))

    this._coreUtil.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigationService.saveTop(SELECTOR)
    return true
  }

  openSidePanel(ev: MouseEvent) {
    ev.stopPropagation()
    this.sidenav.isOpen = true
  }

  search() {
    this._router.navigate(['/dictionary', AppConstants.FOREIGN_LANG, AppConstants.BASE_LANG])
  }

  onAction(action: string) {
    switch (action) {
      case 'openSidenav':
        this.sidenav.isOpen = true
        break
      case 'signin':
        this._router.navigate(['/signin'])
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
        this._router.navigate(['/dictionary', AppConstants.FOREIGN_LANG, AppConstants.BASE_LANG])
        break
      case 'about':
        this._router.navigate(['/about'])
        break
    }
  }

  signOut() {
    this.sidenav.isOpen = false
    this._authService.signOut()
    this.user = undefined
    this._contentService.clearCache()
    this._getTopics()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => { }, err => this._httpErrorHandler(err))
  }

  uploadFiles() {
    this._contentService.clearCache()
    this._router.navigate(['/admin', 'upload'])
  }

  manageContent() {
    this._contentService.clearCache()
    this._router.navigate(['/admin', 'library'])
  }

  manageUsers() {
    this._contentService.clearCache()
    this._router.navigate(['/admin', 'user'])
  }

  private _getTopics(): Observable<Topic[]> {

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

    return this._contentService.getPublications()
      .map(topics => topics.sort((a, b) => makeSortKey(a).localeCompare(makeSortKey(b))))
      .do((topics: Topic[]) => {
        this.topics = topics
        this._navigationService.restoreTop(SELECTOR)
      })
  }

  private _httpErrorHandler(err: Response) {
    window.alert(`Network Error: ${err.statusText}`)
  }
}
