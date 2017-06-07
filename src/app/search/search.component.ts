import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchApiService, SearchParams, DictPopoverParams, SearchRequest, LemmaSearchResult } from '../content/services/search-api.service'
import { LanguageService } from '../content/services/language.service'
import { SpeechSynthesizerService } from '../core'
import { NavigationService } from '../core'

@Component({
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {

  result = new LemmaSearchResult()
  popoverParams: DictPopoverParams
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
    private _searchApi: SearchApiService,
    private _language: LanguageService,
    private _speechSynthesizer: SpeechSynthesizerService,
    private _navigationService: NavigationService
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
    this._speechSynthesizer.speakSingle(word, this._language.targetLang)
      .takeUntil(this._ngUnsubscribe)
      .subscribe()
  }

  foreignWordSearch(word: string) {
    this.hidePopover()
    this._searchApi.searchEmitter.emit({ word, lang: this._language.targetLang })
  }

  private _showPopover(params: DictPopoverParams) {
    this.hidePopover()
    this.popoverParams = params
    this._changeDetector.detectChanges()
  }
}
