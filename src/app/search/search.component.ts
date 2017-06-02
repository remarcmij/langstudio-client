import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchApi, SearchParams, SearchPopupParams, SearchRequest, SearchResult } from './search-api.service'
import { SpeechSynthesizer } from '../core'
import { Navigation } from '../core'

@Component({
  selector: 'my-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {

  result = new SearchResult()
  popoverParams: SearchPopupParams
  searchRequest: SearchRequest = {
    word: '',
    lang: '',
    attr: 'r',
    chunk: 0
  }
  searchTarget: SearchParams

  readonly THRESHOLD = 480
  width = document.documentElement.clientWidth

  private _searchTerm: string
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _location: Location,
    private _searchApi: SearchApi,
    private _speechSynthesizer: SpeechSynthesizer,
    private _navigationService: Navigation
  ) {
    Observable.fromEvent(window, 'resize', () => document.documentElement.clientWidth)
      .debounceTime(200)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(width => this.width = width)
  }

  ngOnInit() {
    this._searchApi.popupEmitter
      .takeUntil(this._ngUnsubscribe)
      .subscribe(params => this._showPopover(params))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  hidePopover() {
    this.popoverParams = undefined
    this._changeDetector.detectChanges()
  }

  goBack() {
    this._location.back()
  }

  speakWord(word: string) {
    this._speechSynthesizer.speakSingle(word, this._searchApi.targetLang)
  }

  foreignWordSearch(word: string) {
    this.hidePopover()
    this._searchApi.searchEmitter.emit({ word, lang: this._searchApi.targetLang })
  }

  private _showPopover(params: SearchPopupParams) {
    this.hidePopover()
    this.popoverParams = params
    this._changeDetector.detectChanges()
  }
}
