import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs/Subject'

import {
  SearchApiService, SearchRequest,
  LemmaSearchResult, SearchParams, DictPopoverParams
} from '../../content/services/search-api.service'
import { LanguageService } from '../../content/services/language.service'
import { SpeechSynthesizerService } from '../../core'
import { NavigationService } from '../../core'

@Component({
  templateUrl: './dictionary.component.html',
  styles: [
    `.btn {
      padding-left: 10px;
      padding-right: 10px;
    }`
  ]
})
export class DictionaryComponent implements OnInit, OnDestroy {

  result = new LemmaSearchResult()
  popoverParams: DictPopoverParams
  searchRequest: SearchRequest = {
    word: '',
    lang: '',
    attr: 'r',
    chunk: 0
  }

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
    private _navigation: NavigationService
  ) {
  }

  ngOnInit() {
    const params = this._activatedRoute.snapshot.params
    this.searchRequest.word = params['word'] || this.searchRequest.word
    this.searchRequest.lang = this._language.targetLang
    if (this.searchRequest.word) {
      this.wordLangSearch({ word: this.searchRequest.word, lang: this.searchRequest.lang })
    }

    this._searchApi.searchSubject
      .takeUntil(this._ngUnsubscribe)
      .subscribe(target => {
        if (target) {
          this.searchRequest.word = target.word
          this.searchRequest.lang = target.lang
          this.wordLangSearch(target)
        }
      })
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

  wordLangSearch(searchTarget: SearchParams) {
    this.hidePopover()
    this.searchRequest.word = searchTarget.word
    this.searchRequest.lang = searchTarget.lang
    this.searchRequest.chunk = 0
    this.result = new LemmaSearchResult()
    window.scrollTo(0, 0)
    this._searchMore()
  }

  private _searchMore() {
    this._searchApi.searchLemmas(this.result, this.searchRequest)
      .subscribe(result => {
        this.result = result
        if (result.haveMore) {
          this.searchRequest.chunk += 1
          this._searchMore()
        }
      })
  }
}
