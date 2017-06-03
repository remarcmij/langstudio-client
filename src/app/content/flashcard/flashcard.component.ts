import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import * as debounce from 'lodash.debounce'
import * as equal from 'deep-equal'

import { Article } from '../article/article.model'
import { ContentApi } from '../content-api.service'
import { FlashcardService, Flashcard } from './flashcard.service'
import { SpeechSynthesizer } from '../../core'
// import { NavButton } from '../../shared'

const keyCodeSpace = 32
const keyCodeBackSpace = 8
const keyCodeLeftArrow = 37
const keyCodeRightArrow = 39
const interceptKeyCodes = [keyCodeSpace, keyCodeBackSpace, keyCodeLeftArrow, keyCodeRightArrow]
const buttonDelay = 200

@Component({
  selector: 'my-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.scss']
})
export class FlashCardComponent implements OnInit, OnDestroy {
  article: Article
  publication: string
  chapter: string
  flashCard: Flashcard
  sliderIndex = 0

  currentPage = 0
  numPages: number

  // private navButtons: NavButton[] = []

  get autoPlay() {
    return this._flashCardService.autoPlay
  }

  set autoPlay(value: boolean) {
    this._flashCardService.autoPlay = value
  }

  get speechEnabled() {
    return this._flashCardService.speechEnabled
  }

  set speechEnabled(value: boolean) {
    this._flashCardService.speechEnabled = value
  }

  private _goIndexDebounced: (index: number) => void
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _contentHttp: ContentApi,
    private _flashCardService: FlashcardService,
    private _speechSynthesizer: SpeechSynthesizer
  ) {
    this._goIndexDebounced = debounce(this.goIndex.bind(this), buttonDelay)
  }

  ngOnInit() {

    // this.updateNavButtons()

    const params = this._activatedRoute.snapshot.params
    this.publication = params['publication']
    this.chapter = params['chapter']
    this._contentHttp
      .getArticle(this.publication, this.chapter)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(article => {
        this.article = article
        // this.updateNavButtons()
        this._flashCardService.setArticle(article, this.flashCardCallback.bind(this))
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })

    Observable.fromEvent(document.body, 'keyup')
      .debounceTime(250)
      .filter((ev: KeyboardEvent) => interceptKeyCodes.indexOf(ev.keyCode) !== -1)
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        if (ev.keyCode === keyCodeSpace || ev.keyCode === keyCodeRightArrow) {
          this.goNext()
        } else {
          this.goPrev()
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
    this._flashCardService.stop()
  }

  goNext() {
    if (this.canGoNext()) {
      this._goIndexDebounced(this._flashCardService.lastIndex + 1)
    }
  }

  goLast() {
    this._goIndexDebounced(this._flashCardService.getFlashCardCount() * 2 - 1)
  }

  canGoNext(): boolean {
    return this._flashCardService.lastIndex < this._flashCardService.getFlashCardCount() * 2 - 1
  }


  canGoPrev(): boolean {
    return this._flashCardService.lastIndex > 0
  }

  goPrev() {
    if (this.canGoPrev()) {
      this._goIndexDebounced(Math.max(this._flashCardService.lastIndex - 1, 0))
    }
  }

  goFirst() {
    this._goIndexDebounced(0)
  }

  goIndex(index: number) {
    this._flashCardService.autoPlay = false
    this._flashCardService.lastIndex = index
  }

  flashCardCallback(flashCard: Flashcard) {
    this.flashCard = flashCard
    this.sliderIndex = this._flashCardService.lastIndex

    // needed on iOS
    this._changeDetector.detectChanges()
  }

  getFlashCardNumber(): number {
    return Math.floor(this._flashCardService.lastIndex / 2) + 1
  }

  getFlashCardCount(): number {
    return this._flashCardService.getFlashCardCount()
  }

  // private updateNavButtons(): NavButton[] {
  //   const buttons: NavButton[] = []

  //   if (this.article && this._speechSynthesizer.canSpeakLanguage(this.article.foreignLang)
  //     && this._speechSynthesizer.canSpeakLanguage(this.article.baseLang)) {
  //     buttons.push({
  //       faName: this._flashCardService.speechEnabled ? 'fa-volume-up' : 'fa-volume-off',
  //       command: this._flashCardService.speechEnabled ? 'speechOff' : 'speechOn'
  //     })
  //   }
  //   buttons.push({
  //     faName: 'fa-cog',
  //     command: 'settings'
  //   })

  //   if (!equal(this.navButtons, buttons, { strict: true })) {
  //     this.navButtons = buttons
  //   }

  //   return this.navButtons
  // }

  commandHandler(command: string) {
    switch (command) {

      case 'play':
        this._flashCardService.autoPlay = true
        break

      case 'pause':
        this._flashCardService.autoPlay = false
        break

      case 'speechOff':
        this._flashCardService.speechEnabled = false
        // this.updateNavButtons()
        break

      case 'speechOn':
        this._flashCardService.speechEnabled = true
        // this.updateNavButtons()
        break

      case 'settings':
        // FIXME: add code
        break

      default:
        throw new Error('unknown NavButton command')
    }
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library', this.publication, this.chapter])
        break

      case 'play':
        this._flashCardService.autoPlay = true
        break

      case 'pause':
        this._flashCardService.autoPlay = false
        break

      case 'speechOff':
        this._flashCardService.speechEnabled = false
        // this.updateNavButtons()
        break

      case 'speechOn':
        this._flashCardService.speechEnabled = true
        // this.updateNavButtons()
        break

      case 'settings':
        // FIXME: add code
        break

    }
  }

}
