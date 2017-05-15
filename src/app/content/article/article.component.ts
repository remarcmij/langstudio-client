import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { Article, AnchorInfo } from './article.model'
import { DictPopoverInput } from '../../dictionary/dict-popover/dict-popover.component'
import { ContentHttp } from '../content-http.service'
import { SpeechSynthesizer } from '../../core'
import { CoreUtil } from '../../core'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { FlashCardService } from '../flashcard/flashcard.service'
import { NavButton } from '../../shared'

const SELECTOR = 'my-article'

@Component({
  selector: SELECTOR,
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  article: Article
  publication: string
  chapter: string
  tag: string
  hashTag: string
  popoverInput: DictPopoverInput
  scrollState = 'busy'
  sidepanel: { isopen: boolean } = { isopen: false }
  anchors: AnchorInfo[] = []
  sidenavOpen = false
  hasFlashCards = false
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    private _zone: NgZone,
    private _coreUtil: CoreUtil,
    private _contentHttp: ContentHttp,
    private _speechSynthesizer: SpeechSynthesizer,
    private _navigationService: NavigationService,
    private _flashCardService: FlashCardService
  ) {
  }

  ngOnInit() {
    this.article = this._route.snapshot.data['article']
    this.hidePopover()

    this._navigationService.popTopEmitter
      .takeUntil(this._ngUnsubscribe)
      .subscribe((scrollState: string) => this.scrollState = scrollState)

    const params = this._route.snapshot.params
    this.scrollState = 'busy'
    this.publication = params['publication']
    this.chapter = params['chapter']
    this.tag = params['tag']
    this.hasFlashCards = this._flashCardService.hasFlashCards(this.article)
    if (!this.tag) {
      this._navigationService.restoreTop(SELECTOR)
    }

    this._coreUtil.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))

    this._changeDetector.markForCheck()
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigationService.saveTop(SELECTOR)
    return true
  }

  // ngAfterViewChecked() {
  //   let element = document.getElementById('anchor')
  //   if (element && this.tag) {
  //     element.removeAttribute('id')
  //     let parent = element.parentElement
  //     while (parent.tagName !== 'ARTICLE') {
  //       element = parent
  //       parent = element.parentElement
  //     }
  //     const headerElement = element.previousElementSibling
  //     if (headerElement && /^H/.test(headerElement.tagName) && headerElement.id) {
  //       this.scrollToAnchor(headerElement.id)
  //     }
  //     setTimeout(() => {
  //       this.scrollState = 'ready'
  //     })
  //   }
  // }

  // jumpToHashTag() {
  //   if (this.tag) {
  //     this.zone.runOutsideAngular(() => {
  //       setTimeout(() => {
  //         this.zone.run(() => {
  //           let element = <HTMLElement>document.getElementById('hashtag0')
  //           let parent = element.parentElement
  //           while (parent.tagName !== 'ARTICLE') {
  //             element = parent
  //             parent = element.parentElement
  //           }
  //           const headerElement = <HTMLElement>element.previousElementSibling
  //           if (headerElement && /^H/.test(headerElement.tagName) && headerElement.id) {
  //             this.scrollToAnchor(headerElement.id)
  //           }
  //           this.scrollState = 'ready'
  //         })
  //       }, 250)
  //     })
  //   }
  // }

  scrollToAnchor(name: string) {
    this.sidenavOpen = false
    const element = <HTMLElement>document.getElementById(name)
    if (element) {
      element.scrollIntoView()
      document.body.scrollTop -= 64
    }
  }

  onClick(ev: MouseEvent) {
    if (ev.altKey || this._speechSynthesizer.speechEnabled) {
      if (this._speechSynthesizer.isSynthesisSupported()) {
        let text: string
        if (this.article.foreignLang === this.article.baseLang) {
          text = this._getClickedParagraphText()
        } else {
          const targetElem = <HTMLElement>event.target
          text = targetElem.parentElement.textContent
        }
        this._speechSynthesizer.speakMulti(text, this.article.foreignLang, {
          rate: this._speechSynthesizer.getSpeechRate()
        })
      }
    } else {
      const target = <HTMLElement>ev.target
      if (target.tagName === 'SPAN') {
        ev.preventDefault()
        ev.stopPropagation()
        let text = target.innerText.trim()
        if (/^#/.test(text)) {
          this.hashTagClicked(text.slice(1).trim())
        } else {
          text = this._coreUtil.cleanseTerm(text)
          const top = this._coreUtil.cumulativeTop(target) - document.querySelector('#my-content').scrollTop
          const style = window.getComputedStyle(target)
          const height = parseInt(style.getPropertyValue('line-height'), 10)
          this.showPopover(text, top, height)
        }
      }
    }
  }

  showPopover(word: string, top: number, height: number) {
    this.hidePopover()
    this.popoverInput = {
      word: word,
      lang: this.article.foreignLang,
      top: top,
      height: height
    }
    this._changeDetector.detectChanges()
  }

  hidePopover() {
    this.popoverInput = undefined
    this.hashTag = undefined
    this._changeDetector.detectChanges()
  }

  wordSearch(word?: string) {
    const params: any = {}
    if (word) {
      params.word = word
    }
    this._router.navigate(['/dictionary', this.article.foreignLang, this.article.baseLang, params])
  }

  speakWord(word: string) {
    this._speechSynthesizer.speakSingle(word, this.article.foreignLang)
  }

  hashTagClicked(hashTag: string) {
    this._contentHttp.getHashTagItems(hashTag)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(items => {
        if (items.length === 1 && items[0].publication === this.publication && items[0].chapter === this.chapter) {
          // todo
        }
        // this.router.navigate(['/hashtag', hashTag])
        this.hashTag = hashTag
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })
  }

  onAction(action: string) {
    this.sidenavOpen = false
    switch (action) {
      case 'more':
        this.sidenavOpen = true
        console.log('opening')
        break
      case 'back':
        this._navigationService.clearTop(SELECTOR)
        this._router.navigate(['/library', this.publication])
        break
      case 'search':
        this.wordSearch()
        break
      case 'more':
        this.sidepanel.isopen = true
        break
      case 'flashcards':
        this._router.navigate(['/library', this.publication, this.chapter, 'flashcards'])
        break
      case 'toggleSpeech':
        this._speechSynthesizer.speechEnabled = !this._speechSynthesizer.speechEnabled
        break
      case 'allTags':
        this._router.navigate(['/hashtag'])
        break
    }
  }

  acceptAnchors(anchors: AnchorInfo[]) {
    this.anchors = anchors
  }

  private _getClickedParagraphText(): string {
    const s = window.getSelection()
    const range = s.getRangeAt(0)
    const node = s.anchorNode
    const nodeLength = node.textContent.length

    while (range.startOffset > 0 && range.toString().indexOf(' ') !== 0) {
      range.setStart(node, range.startOffset - 1)
    }

    if (range.toString().indexOf(' ') === 0) {
      range.setStart(node, range.startOffset + 1)
    }

    while (range.endOffset < nodeLength && range.toString().indexOf(' ') === -1) {
      range.setEnd(node, range.endOffset + 1)
    }

    return range.toString().trim()
  }

}
