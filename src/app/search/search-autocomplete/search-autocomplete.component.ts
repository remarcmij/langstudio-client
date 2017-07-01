import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, Renderer, ViewChild, ElementRef } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MdAutocompleteTrigger } from '@angular/material'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchApiService, WordLang } from '../../content/services/search-api.service'
import { ContentService } from '../../content/services/content.service'
import { LanguageService } from '../../content/services/language.service'
import { NavigationService } from '../../core'

const MAX_ITEMS = 20
const SCROLL_THRESHOLD = 16

@Component({
  selector: 'my-search-autocomplete',
  templateUrl: './search-autocomplete.component.html',
  styles: [
    `:host {
      margin-left: 8px;
      font-size: 16px;
    }`
  ]
})
export class SearchAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {

  searchCtrl = new FormControl()
  term: string
  items: WordLang[] = []
  targetLang: string

  @ViewChild(MdAutocompleteTrigger) private _trigger: MdAutocompleteTrigger
  @ViewChild('searchField') private _input: ElementRef
  private _ngUnsubscribe = new Subject<void>()
  private _subject = new Subject<string>()

  constructor(
    private renderer: Renderer,
    private navigation: NavigationService,
    private searchApi: SearchApiService,
    private content: ContentService,
    private language: LanguageService
  ) {
  }

  ngOnInit() {
    this.targetLang = this.language.targetLang

    this._subject
      .debounceTime(250)
      .switchMap((term: string) => this.searchApi.autoCompleteSearch(term))
      .map(items => items.slice(0, MAX_ITEMS))
      .takeUntil(this._ngUnsubscribe)
      .subscribe(items => {
        this.items = items
        if (items.length > 0) {
          this.searchApi.searchSubject.next(items[0])
        }
      }, err => console.error(err))

  }

  ngAfterViewInit() {
    const searchField = this._input.nativeElement

    this.content.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => {
        this._trigger.closePanel()
        this.term = ''
        this.renderer.invokeElementMethod(searchField, 'focus')
      })

    Observable.fromEvent(searchField, 'keyup')
      .filter((ev: KeyboardEvent) => ev.key === 'Enter')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: KeyboardEvent) => {
        if (this.items.length > 0) {
          ev.preventDefault()
          ev.stopPropagation()
          this.onItemSelect(this.items[0])
        }
      })

    this.navigation.scrollDetectorFor(document.querySelector('#my-content'))
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this._trigger.closePanel())

    setTimeout(() => {
      this.renderer.invokeElementMethod(searchField, 'focus')
    })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  onItemSelect(item: WordLang) {
    this.items = []
    this.term = item.word
    this.searchApi.searchSubject.next(item)
  }

  onChange(ev: any) {
    if (typeof ev === 'object') {
      this.term = (<WordLang>ev).word
    } else if (typeof ev === 'string') {
      ev = ev.toLowerCase().trim()
      if (ev.length > 0) {
        this._subject.next(ev)
      }
    }
  }
}
