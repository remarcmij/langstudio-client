import {
  Component, ElementRef, OnInit, OnDestroy, AfterViewChecked, Input, Output, EventEmitter,
  Renderer, ChangeDetectorRef, NgZone
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { DictionaryHttp } from '../dictionary-http.service'
import { SpeechSynthesizer } from '../../core'
import * as myUtil from '../../core'

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

  prevScrollTop = -1
  popoverHeight: number
  subscriptions$: Subscription[] = []

  constructor(
    private elementRef: ElementRef,
    private httpService: DictionaryHttp,
    private sanitizer: DomSanitizer,
    private renderer: Renderer,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private speechSynthesizer: SpeechSynthesizer
  ) {
  }

  ngOnInit() {

    this.scrollState = 'busy'

    this.httpService.popoverSearch(this.input.word, this.input.lang)
      .then(resp => {
        if (!resp) {
          this.errorText = 'Not in in dictionary.'
        } else {
          const htmlText = myUtil.tinyMarkdown(resp.text)
          this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(htmlText)
          this.baseWords = resp.baseWords
          this.baseList = resp.baseWords.join(', ')
          this.resolvedWord = resp.resolvedWord
        }
      }
      )
      .catch(() => this.errorText = 'The server returned an error')

    const scrollDiv = document.querySelector('#my-content')
    const sub1$ = Observable.fromEvent(scrollDiv, 'scroll')
      .subscribe(() => {
        const scrollTop = scrollDiv.scrollTop
        if (this.prevScrollTop === -1) {
          this.prevScrollTop = scrollTop
        } else if (Math.abs(this.prevScrollTop - scrollTop) >= scrollDistBeforeHide) {
          this.shouldHide.emit()
        }
      })
    this.subscriptions$.push(sub1$)

    // ignore clicks on popover body
    const sub2$ = Observable.fromEvent(this.elementRef.nativeElement, 'click')
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
      })
    this.subscriptions$.push(sub2$)

    // hide on clicks outside the popover
    const sub3$ = Observable.fromEvent(window, 'click')
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this.shouldHide.emit()
      })
    this.subscriptions$.push(sub3$)

    const sub4$ = Observable.fromEvent(window, 'touchmove')
      .subscribe(() => this.shouldHide.emit())
    this.subscriptions$.push(sub4$)
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(subscription => subscription.unsubscribe())
  }

  ngAfterViewChecked() {
    if (this.popoverHeight !== this.elementRef.nativeElement.clientHeight) {
      this.popoverHeight = this.elementRef.nativeElement.clientHeight
      let popoverTop = this.input.top - this.popoverHeight
      const navbarElem = <HTMLElement>document.querySelector('md-toolbar')
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
    return this.speechSynthesizer.canSpeakLanguage(this.input.lang)
  }
}
