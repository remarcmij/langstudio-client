import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms'
import { MdAutocompleteTrigger } from '@angular/material'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'

import { DictionaryHttp, WordLang } from '../dictionary-http.service'

const MAX_ITEMS = 20

@Component({
  selector: 'my-dict-autocomplete',
  templateUrl: './dict-autocomplete.component.html',
  styles: [
    `:host {
        vertical-align: middle;
    }`,
    `input[type="search"] {
        width: 180px;
        font-size: 15px;
        box-sizing: border-box;
        border: none;
        border-radius: 2px;
        box-shadow: none;
        padding: 0 15px;
        line-height: 40px;
        height: 40px;
    }`,
    `input[type="search"]:focus {
        outline: 0;
    }`
  ]
})
export class DictAutocompleteComponent {

  searchCtrl = new FormControl()
  term: string
  items$: Observable<any>
  @ViewChild(MdAutocompleteTrigger) trigger: MdAutocompleteTrigger
  @Output() onSelect = new EventEmitter<WordLang>()

  constructor(
    private _dictHttp: DictionaryHttp
  ) { }

  onItemSelect(item: WordLang) {
    this.items$ = Observable.from([])
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
      this.items$ = this._dictHttp
        .autoCompleteSearch(ev)
        .map(items => items.slice(0, MAX_ITEMS))
        .catch(err => {
          console.error(err)
          return []
        })
    }
  }

}
