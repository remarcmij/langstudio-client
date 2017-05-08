import { Component, OnInit, OnDestroy, Output, ViewChild, AfterViewInit, EventEmitter, ElementRef, Renderer } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'

import { DictionaryHttp, WordLang } from './dictionary-http.service'
import * as myUtil from '../core'

const keyCodeEsc = 27

@Component({
    selector: 'my-search-box',
    templateUrl: './searchbox.component.html',
    styles: [
        `:host {
            vertical-align: middle;
        }`,
        `input[type="search"] {
            width: 150px;
            font-size: 14px;
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
export class SearchBoxComponent implements OnInit, OnDestroy, AfterViewInit {
    customSelected = ''
    selected = ''
    dataSource: Observable<any>
    asyncSelected = ''
    typeaheadLoading = false
    typeaheadNoResults = false

    @Output() selectItem = new EventEmitter<WordLang>()
    @ViewChild('searchField') input: ElementRef

    private subscription: Subscription

    constructor(
        private renderer: Renderer,
        private httpService: DictionaryHttp
    ) {
    }

    ngOnInit() {
        this.dataSource = Observable.create((observer: Observer<string>) => {
            // Runs on every search
            observer.next(this.asyncSelected.toLowerCase())
        }).mergeMap((term: string) => this.httpService
            .autoCompleteSearch(term)
            .map((items: any) => items.slice(0, 5))
            .catch(err => {
                console.error(err)
                return []
            }))

        this.subscription = Observable.fromEvent(document.body, 'keyup')
            .subscribe((ev: KeyboardEvent) => {
                if (ev.keyCode === keyCodeEsc) {
                    ev.preventDefault()
                    ev.stopPropagation()
                    this.clearInput()
                }
            })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

    ngAfterViewInit() {
        if (!myUtil.isMobile()) {
            this.clearInput()
        }
    }

    clearInput() {
        this.asyncSelected = ''
        this.renderer.invokeElementMethod(this.input.nativeElement, 'focus')
    }

    changeTypeaheadLoading(e: boolean) {
        this.typeaheadLoading = e
    }

    changeTypeaheadNoResults(e: boolean) {
        this.typeaheadNoResults = e
    }

    typeaheadOnSelect(e: any) {
        this.selectItem.emit(e.item)
    }
}
