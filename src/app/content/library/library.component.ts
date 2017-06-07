import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { AuthService, User } from '../../core'
import { ContentApiService } from '../services/content-api.service'
import { ContentService } from '../services/content.service'
import { Topic } from '../../shared'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { config } from '../../app.config'

const SELECTOR = 'library'

@Component({
  templateUrl: './library.component.html',
  styles: []
})
export class LibraryComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  sidenav = { isOpen: false }
  topics: Topic[]
  scrollState = 'busy'
  readonly title = config.appTitle
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _content: ContentService,
    private _auth: AuthService,
    private _contentApi: ContentApiService,
    private _navigation: NavigationService
  ) { }

  ngOnInit() {
    this._navigation.scrollState
      .takeUntil(this._ngUnsubscribe)
      .subscribe(state => this.scrollState = state)

    this._getTopics()
      .subscribe(null, err => window.alert(`Error: ${err}`))

    this._content.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigation.saveTop(SELECTOR)
    return true
  }

  openSidePanel(ev: MouseEvent) {
    ev.stopPropagation()
    this.sidenav.isOpen = true
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
        this._router.navigate(['/search/dict'])
        break
      case 'about':
        this._router.navigate(['/about'])
        break
      case 'closeSidenav':
        this.sidenav.isOpen = false
        break
    }
  }

  signOut() {
    this.sidenav.isOpen = false
    this._auth.signOut()
    this._contentApi.clearCache()
    this._getTopics()
      .subscribe(null, err => window.alert(`Error: ${err}`))
  }

  uploadFiles() {
    this._contentApi.clearCache()
    this._router.navigate(['/admin', 'upload'])
  }

  manageContent() {
    this._contentApi.clearCache()
    this._router.navigate(['/admin', 'library'])
  }

  manageUsers() {
    this._contentApi.clearCache()
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

    return this._contentApi.getPublications()
      .map(topics => topics.sort((a, b) => makeSortKey(a).localeCompare(makeSortKey(b))))
      .do((topics: Topic[]) => {
        this.topics = topics
        this._navigation.restoreTop(SELECTOR)
      })
  }

  private _httpErrorHandler(err: Response) {
    window.alert(`Network Error: ${err.statusText}`)
  }
}
