import {
    Component, ElementRef, OnInit, OnDestroy, AfterViewChecked, Input, Output, EventEmitter,
    Renderer, ChangeDetectorRef, NgZone
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { DictionaryHttpService } from './dictionary-http.service'
import { SpeechService } from '../core'
import { UtilityService } from '../core'

const scrollDistBeforeHide = 16

export interface DictPopoverInput {
    word: string
    lang: string
    top: number
    height: number
}

@Component({
    selector: 'my-dict-popover',
    templateUrl: './dict-popover.component.html',
    styles: []
})
export class DictPopoverComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() input: DictPopoverInput
    @Output() wordSearch = new EventEmitter<string>()
    @Output() speakWord = new EventEmitter<string>()
    @Output() shouldHide = new EventEmitter<void>()

    errorText: string
    safeHtml: SafeHtml
    baseWords: string[]
    baseList: string
    resolvedWord: string
    scrollState = 'busy'

    private prevScrollTop = -1
    private popoverHeight: number
    private subscriptions: Subscription[] = []

    constructor(
        private elementRef: ElementRef,
        private httpService: DictionaryHttpService,
        private sanitizer: DomSanitizer,
        private renderer: Renderer,
        private zone: NgZone,
        private cdr: ChangeDetectorRef,
        private utilityService: UtilityService,
        private speechService: SpeechService
    ) {
    }

    ngOnInit(): void {

        this.scrollState = 'busy'

        let subscription = this.httpService.popoverSearch(this.input.word, this.input.lang)
            .subscribe(resp => {
                if (!resp) {
                    this.errorText = 'Not in in dictionary.'
                } else {
                    let htmlText = this.utilityService.tinyMarkdown(resp.text)
                    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlText)
                    this.baseWords = resp.baseWords
                    this.baseList = resp.baseWords.join(', ')
                    this.resolvedWord = resp.resolvedWord
                }
            }, () => {
                this.errorText = 'The server returned an error'
            })
        this.subscriptions.push(subscription)

        subscription = Observable.fromEvent(window, 'scroll')
            .subscribe(() => {
                let scrollTop = document.body.scrollTop
                if (this.prevScrollTop === -1) {
                    this.prevScrollTop = scrollTop
                } else if (Math.abs(this.prevScrollTop - scrollTop) >= scrollDistBeforeHide) {
                    this.shouldHide.emit()
                }
            })
        this.subscriptions.push(subscription)

        // ignore clicks on popover body
        subscription = Observable.fromEvent(this.elementRef.nativeElement, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
            })
        this.subscriptions.push(subscription)

        // hide on clicks outside the popover
        subscription = Observable.fromEvent(window, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
                this.shouldHide.emit()
            })
        this.subscriptions.push(subscription)

        subscription = Observable.fromEvent(window, 'touchmove')
            .subscribe(() => {
                this.shouldHide.emit()
            })
        this.subscriptions.push(subscription)
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe())
    }

    ngAfterViewChecked(): void {
        if (this.popoverHeight !== this.elementRef.nativeElement.clientHeight) {
            this.popoverHeight = this.elementRef.nativeElement.clientHeight
            let popoverTop = this.input.top - this.popoverHeight
            let navbarElem = <HTMLElement>document.getElementsByClassName('navbar')[0]
            if (popoverTop <= navbarElem.offsetHeight) {
                popoverTop = this.input.top + this.input.height
            }
            if (popoverTop + this.popoverHeight > window.innerHeight) {
                popoverTop = navbarElem.offsetHeight + this.input.height
            }
            this.renderer.setElementStyle(this.elementRef.nativeElement, 'top', `${popoverTop}px`)

            if (this.safeHtml || this.errorText) {
                this.zone.runOutsideAngular(() => {
                    window.requestAnimationFrame(() => {
                        this.scrollState = 'ready'
                        this.cdr.detectChanges()
                    })
                })
            }
        }
    }

    onSearchWordClick(event: MouseEvent, word: string) {
        event.stopPropagation()
        this.wordSearch.emit(word)
    }

    onSpeakWordClick(event: MouseEvent, word: string) {
        event.stopPropagation()
        this.speakWord.emit(word)
    }

    canSpeak(): boolean {
        return this.speechService.canSpeakLanguage(this.input.lang)
    }
}
