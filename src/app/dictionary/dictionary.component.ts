import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { DictionaryHttp, WordLang, SearchRequest, SearchResult } from './dictionary-http.service'
import { SpeechSynthesizer } from '../core'
import { NavigationService } from '../core'
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

  req: SearchRequest = {
    word: '',
    lang: '',
    attr: 'r',
    chunk: 0
  }

  result = new SearchResult()

  searchTerm: string
  disabled = false;
  status: { isopen: boolean } = { isopen: false }
  popoverInput: DictPopoverInput

  foreignLang: string
  baseLang: string
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private dictHttp: DictionaryHttp,
    private speechSynthesizer: SpeechSynthesizer,
    private navigationService: NavigationService
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params
      .takeUntil(this._ngUnsubscribe)
      .subscribe((params: any) => {
        this.foreignLang = params['foreign']
        this.baseLang = params['base']
        this.req.word = params['word'] || this.req.word
        this.req.lang = this.foreignLang
        if (this.req.word) {
          this.wordLangSearch({ word: this.req.word, lang: this.req.lang })
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  popoverSearch(event: any) {
    this.hidePopover()
    this.popoverInput = {
      word: event.word,
      lang: this.foreignLang,
      top: event.top,
      height: event.height
    }
    this.cdr.detectChanges()
  }

  hidePopover() {
    this.popoverInput = undefined
    this.cdr.detectChanges()
  }

  goBack() {
    this.location.back()
    // this.router.navigate(this.backRoute)
  }

  executeSearch(word: string, event: MouseEvent) {
    if (event.shiftKey) {
      this.searchTerm = ''
    } else {
      this.wordLangSearch({ word, lang: this.foreignLang })
    }
  }

  searchTermChanged() {

  }

  foreignWordSearch(word: string) {
    this.wordLangSearch({ word, lang: this.foreignLang })
    // this.router.navigate(['/dictionary', this.foreignLang, this.baseLang, { word }])
  }

  wordLangSearch(item: WordLang) {
    this.hidePopover()

    this.req.word = item.word
    this.req.lang = item.lang
    this.req.chunk = 0

    this.result = new SearchResult()

    window.scrollTo(0, 0)

    this._searchMore()
  }

  speakWord(word: string) {
    this.speechSynthesizer.speakSingle(word, this.foreignLang)
  }

  private _searchMore() {
    this.dictHttp.searchWord(this.result, this.req)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(result => {
        this.result = result
        if (result.haveMore) {
          this.req.chunk += 1
          this._searchMore()
        }
      })
  }
}
