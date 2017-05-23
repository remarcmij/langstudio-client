import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchHttp, WordLang, SearchRequest, SearchResult } from '../search-http.service'
import { SpeechSynthesizer } from '../../core'
import { NavigationService } from '../../core'
import { DictPopoverInput } from './dict-popover/dict-popover.component'

@Component({
  selector: 'my-dictionary',
  templateUrl: './dictionary.component.html',
  styles: [
    `.btn {
      padding-left: 10px;
      padding-right: 10px;
    }`
  ]
})
export class DictionaryComponent implements OnInit, OnDestroy {

  result = new SearchResult()
  popoverInput: DictPopoverInput
  searchRequest: SearchRequest = {
    word: '',
    lang: '',
    attr: 'r',
    chunk: 0
  }

  private _searchTerm: string
  private _foreignLang: string
  private _baseLang: string
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _location: Location,
    private _searchHttp: SearchHttp,
    private _speechSynthesizer: SpeechSynthesizer,
    private _navigationService: NavigationService
  ) {
  }

  ngOnInit() {
    this._activatedRoute.params
      .takeUntil(this._ngUnsubscribe)
      .subscribe(params => {
        this._foreignLang = params['target']
        this._baseLang = params['base']
        this.searchRequest.word = params['word'] || this.searchRequest.word
        this.searchRequest.lang = this._foreignLang
        if (this.searchRequest.word) {
          this.wordLangSearch({ word: this.searchRequest.word, lang: this.searchRequest.lang })
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  popoverSearch(event: any) {
    this.hidePopover()
    this.popoverInput = {
      word: event.word,
      lang: this._foreignLang,
      top: event.top,
      height: event.height
    }
    this._changeDetector.detectChanges()
  }

  hidePopover() {
    this.popoverInput = undefined
    this._changeDetector.detectChanges()
  }

  goBack() {
    this._location.back()
  }

  executeSearch(word: string, event: MouseEvent) {
    if (event.shiftKey) {
      this._searchTerm = ''
    } else {
      this.wordLangSearch({ word, lang: this._foreignLang })
    }
  }

  searchTermChanged() {

  }

  foreignWordSearch(word: string) {
    this.wordLangSearch({ word, lang: this._foreignLang })
  }

  wordLangSearch(item: WordLang) {
    this._ngUnsubscribe.next()
    this.hidePopover()
    this.searchRequest.word = item.word
    this.searchRequest.lang = item.lang
    this.searchRequest.chunk = 0
    this.result = new SearchResult()
    window.scrollTo(0, 0)
    this._searchMore()
  }

  speakWord(word: string) {
    this._speechSynthesizer.speakSingle(word, this._foreignLang)
  }

  private _searchMore() {
    this._searchHttp.searchWord(this.result, this.searchRequest)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(result => {
        this.result = result
        if (result.haveMore) {
          this.searchRequest.chunk += 1
          this._searchMore()
        }
      })
  }
}
