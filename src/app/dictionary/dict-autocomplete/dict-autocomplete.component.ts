import { Component, OnInit, OnDestroy, AfterViewInit, Output, EventEmitter, Renderer, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms'
import { MdAutocompleteTrigger } from '@angular/material'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { DictionaryHttp, WordLang } from '../dictionary-http.service'
import { CoreUtil } from '../../core'

const MAX_ITEMS = 20
const SCROLL_THRESHOLD = 16

@Component({
  selector: 'my-dict-autocomplete',
  templateUrl: './dict-autocomplete.component.html',
  styles: [
    `:host {
      margin-left: 8px;
      font-size: 16px;
    }`
  ]
})
export class DictAutocompleteComponent implements OnInit, AfterViewInit, OnDestroy {

  searchCtrl = new FormControl()
  term: string
  items: WordLang[] = []
  @Output() onSelect = new EventEmitter<WordLang>()
  @ViewChild(MdAutocompleteTrigger) private _trigger: MdAutocompleteTrigger
  @ViewChild('searchField') private _input: ElementRef
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _renderer: Renderer,
    private _coreUtil: CoreUtil,
    private _dictHttp: DictionaryHttp
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this._coreUtil.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => {
        this._trigger.closePanel()
        this.term = ''
        this._renderer.invokeElementMethod(this._input.nativeElement, 'focus')
      })

    Observable.fromEvent(this._input.nativeElement, 'keyup')
      .filter((ev: KeyboardEvent) => ev.key === 'Enter')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: KeyboardEvent) => {
        if (this.items.length > 0) {
          ev.preventDefault()
          ev.stopPropagation()
          this.onItemSelect(this.items[0])
        }
      })

    this._coreUtil.scrollDetectorFor(document.querySelector('#my-content'))
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this._trigger.closePanel())
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  onItemSelect(item: WordLang) {
    this.items = []
    this.term = ''
    this.onSelect.emit(item)
  }

  onChange(ev: any) {
    if (typeof ev !== 'string') {
      this.term = ''
      return
    }
    ev = ev.toLowerCase().trim()
    if (ev.length > 0) {
      this._dictHttp
        .autoCompleteSearch(ev)
        .map(items => items.slice(0, MAX_ITEMS))
        .takeUntil(this._ngUnsubscribe)
        .subscribe(items => {
          this.items = items
          if (items.length > 0) {
            this.onSelect.emit(items[0])
          }
        }, err => console.error(err))
    }
  }
}
