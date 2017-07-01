import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchApiService, WordLang, DictPopoverParams, SearchRequest, LemmaSearchResult } from '../content/services/search-api.service'
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
  searchTarget: WordLang

  readonly THRESHOLD = 480
  width = document.documentElement.clientWidth

  private _searchTerm: string
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private searchApi: SearchApiService,
    private language: LanguageService,
    private speech: SpeechSynthesizerService,
    private navigation: NavigationService
  ) {
    Observable.fromEvent(window, 'resize', () => document.documentElement.clientWidth)
      .debounceTime(200)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(width => this.width = width)
  }

  ngOnInit() {
    this.searchApi.showPopover
      .takeUntil(this._ngUnsubscribe)
      .subscribe(params => this._showPopover(params))
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  hidePopover() {
    this.popoverParams = undefined
    this.cdr.detectChanges()
  }

  goBack() {
    this.location.back()
  }

  speakWord(word: string) {
    this.speech.speakSingle(word, this.language.targetLang)
      .takeUntil(this._ngUnsubscribe)
      .subscribe()
  }

  foreignWordSearch(word: string) {
    this.hidePopover()
    this.searchApi.searchSubject.next({ word, lang: this.language.targetLang })
  }

  private _showPopover(params: DictPopoverParams) {
    this.hidePopover()
    this.popoverParams = params
    this.cdr.detectChanges()
  }
}
