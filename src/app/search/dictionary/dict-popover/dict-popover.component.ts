import {
  Component, ElementRef, OnInit, AfterViewInit, OnDestroy, AfterViewChecked, Input, Output, EventEmitter,
  Renderer, ChangeDetectorRef, NgZone
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchHttp } from '../../search-http.service'
import { SpeechSynthesizer } from '../../../core'
import { CoreUtil } from '../../../core'

const SCROLL_THRESHOLD = 16

export interface DictPopoverInput {
  word: string
  lang: string
  top: number
  height: number
}

@Component({
  selector: 'my-dict-popover',
  templateUrl: './dict-popover.component.html',
  styleUrls: ['./dict-popover.component.scss']
})
export class DictPopoverComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
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
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _elementRef: ElementRef,
    private _searchHttp: SearchHttp,
    private _sanitizer: DomSanitizer,
    private _renderer: Renderer,
    private _zone: NgZone,
    private _changeDetector: ChangeDetectorRef,
    private _coreUtil: CoreUtil,
    private _speechSynthesizer: SpeechSynthesizer
  ) {
  }

  ngOnInit() {

    this._searchHttp.popoverSearch(this.input.word, this.input.lang)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(resp => {
        if (!resp) {
          this.errorText = 'Not in in dictionary.'
        } else {
          const htmlText = this._coreUtil.tinyMarkdown(resp.text)
          this.safeHtml = this._sanitizer.bypassSecurityTrustHtml(htmlText)
          this.baseWords = resp.baseWords
          this.baseList = resp.baseWords.join(', ')
          this.resolvedWord = resp.resolvedWord
        }
      }, error => this.errorText = 'The server returned an error')

  }

  ngAfterViewInit() {

    this._coreUtil.scrollDetectorFor(document.querySelector('#my-content'))
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.shouldHide.emit())

    // ignore clicks on popover body
    Observable.fromEvent(this._elementRef.nativeElement, 'click')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
      })

    // hide on clicks outside the popover
    Observable.fromEvent(window, 'click')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this.shouldHide.emit()
      })

    Observable.fromEvent(window, 'touchmove')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.shouldHide.emit())

  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  ngAfterViewChecked() {
    if (this.popoverHeight !== this._elementRef.nativeElement.clientHeight) {
      this.popoverHeight = this._elementRef.nativeElement.clientHeight
      let popoverTop = this.input.top - this.popoverHeight
      const navbarElem = <HTMLElement>document.querySelector('md-toolbar')
      if (popoverTop <= navbarElem.offsetHeight) {
        popoverTop = this.input.top + this.input.height
      }
      if (popoverTop + this.popoverHeight > window.innerHeight) {
        popoverTop = navbarElem.offsetHeight + this.input.height
      }
      this._renderer.setElementStyle(this._elementRef.nativeElement, 'top', `${popoverTop}px`)

      if (this.safeHtml || this.errorText) {
        this._zone.runOutsideAngular(() => {
          window.requestAnimationFrame(() => {
            this.scrollState = 'ready'
            this._changeDetector.detectChanges()
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
    return this._speechSynthesizer.canSpeakLanguage(this.input.lang)
  }
}
