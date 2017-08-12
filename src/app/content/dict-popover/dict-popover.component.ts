import {
  Component, ElementRef, OnInit, AfterViewInit, OnDestroy, AfterViewChecked, Input, Output, EventEmitter,
  Renderer, ChangeDetectorRef, NgZone
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { SearchApiService, DictPopoverParams } from '../services/search-api.service'
import { MarkdownService } from '../services/markdown.service'
import { SpeechSynthesizerService, NavigationService } from '../../core'

const SCROLL_THRESHOLD = 16

@Component({
  selector: 'my-dict-popover',
  templateUrl: './dict-popover.component.html',
  styleUrls: ['./dict-popover.component.scss']
})
export class DictPopoverComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  @Input() input = <DictPopoverParams>null
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
    private elementRef: ElementRef,
    private searchApi: SearchApiService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private markdown: MarkdownService,
    private navigation: NavigationService,
    private speech: SpeechSynthesizerService
  ) {
  }

  ngOnInit() {

    this.searchApi.popoverSearch(this.input.word, this.input.lang)
      .subscribe(resp => {
        if (!resp) {
          this.errorText = 'Not in in dictionary.'
        } else {
          const body = this.markdown.tinyMarkdown(resp.text)
          this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(body)
          this.baseWords = resp.baseWords
          this.baseList = resp.baseWords.join(', ')
          this.resolvedWord = resp.resolvedWord
        }
      }, error => this.errorText = 'The server returned an error')

  }

  ngAfterViewInit() {

    this.navigation.scrollDetectorFor(document.querySelector('#my-content'))
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.shouldHide.emit())

    // ignore clicks on popover body
    Observable.fromEvent(this.elementRef.nativeElement, 'click')
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
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
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
    return this.speech.canSpeakLanguage(this.input.lang)
  }
}
