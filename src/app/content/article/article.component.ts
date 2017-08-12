import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { Article, AnchorInfo } from './article.model'
import { ContentApiService } from '../services/content-api.service'
import { ContentService } from '../services/content.service'
import { LanguageService } from '../services/language.service'
import { SpeechSynthesizerService } from '../../core'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { SearchApiService, DictPopoverParams } from '../services/search-api.service'
import { DictPopoverService } from '../../content/dict-popover/dict-popover.service'

const SELECTOR = 'article'

@Component({
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  article: Article
  publication: string
  chapter: string
  tag: string
  hashTag: string
  popoverParams: DictPopoverParams
  scrollState = 'busy'
  sidepanel: { isopen: boolean } = { isopen: false }
  anchors: AnchorInfo[] = []
  sidenavOpen = false
  hasFlashCards = false
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private contentApi: ContentApiService,
    private content: ContentService,
    private searchApi: SearchApiService,
    private language: LanguageService,
    private speech: SpeechSynthesizerService,
    private navigation: NavigationService,
    private popover: DictPopoverService
  ) {
  }

  ngOnInit() {
    this.article = this.route.snapshot.data['article']
    this.language.baseLang = this.article.baseLang
    this.language.targetLang = this.article.targetLang
    this.hidePopover()

    this.navigation.scrollState
      .takeUntil(this._ngUnsubscribe)
      .subscribe(state => this.scrollState = state)

    this.searchApi.showPopover
      .takeUntil(this._ngUnsubscribe)
      .subscribe(params => this._showPopover(params))

    const params = this.route.snapshot.params
    this.scrollState = 'busy'
    this.publication = params['publication']
    this.chapter = params['chapter']
    this.tag = params['tag']
    this.hasFlashCards = this.article.rawBody && this.article.rawBody.indexOf(`<!-- flashcard -->`) !== -1
    if (!this.tag) {
      this.navigation.restoreTop(SELECTOR)
    }

    this.content.onEscKey()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => this.onAction('search'))

    this.cdr.markForCheck()
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this.navigation.saveTop(SELECTOR)
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
    if (ev.altKey || this.speech.speechEnabled) {
      if (this.speech.isSynthesisSupported()) {
        let text: string
        if (this.article.targetLang === this.article.baseLang) {
          text = this._getClickedParagraphText()
        } else {
          const targetElem = <HTMLElement>event.target
          text = targetElem.parentElement.textContent
        }
        this.speech.speakMulti(text, this.article.targetLang, {
          rate: this.speech.getSpeechRate()
        }).takeUntil(this._ngUnsubscribe)
          .subscribe()
      }
    } else {
      const target = <HTMLElement>ev.target
      const params = <DictPopoverParams>this.popover.getWordClickParams(target)
      if (params) {
        ev.preventDefault()
        ev.stopPropagation()
        params.lang = this.article.targetLang
        this.searchApi.showPopover.next(params)
      }
    }
  }

  private _showPopover(params: DictPopoverParams) {
    this.hidePopover()
    this.popoverParams = params
    this.cdr.detectChanges()
  }

  hidePopover() {
    this.popoverParams = undefined
    this.hashTag = undefined
    this.cdr.detectChanges()
  }

  wordSearch(word?: string) {
    if (word) {
      this.searchApi.searchSubject.next({ word, lang: this.article.targetLang })
    }
    this.router.navigate(['/search/dict'])
  }

  speakWord(word: string) {
    this.speech.speakSingle(word, this.article.targetLang)
      .takeUntil(this._ngUnsubscribe)
      .subscribe()
  }

  hashTagClicked(hashTag: string) {
    this.contentApi.getHashTagItems(hashTag)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(items => {
        if (items.length === 1 && items[0].publication === this.publication && items[0].chapter === this.chapter) {
          // todo
        }
        // this.router.navigate(['/hashtag', hashTag])
        this.hashTag = hashTag
      }, (err: Response) => {
        if (err.status === 401) {
          this.router.navigate(['/signin'])
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
        this.navigation.clearTop(SELECTOR)
        this.router.navigate(['/library', this.publication])
        break
      case 'search':
        this.wordSearch()
        break
      case 'more':
        this.sidepanel.isopen = true
        break
      case 'flashcards':
        this.router.navigate(['/flashcards', this.publication, this.chapter])
        break
      case 'toggleSpeech':
        this.speech.speechEnabled = !this.speech.speechEnabled
        break
      case 'allTags':
        this.router.navigate(['/hashtag'])
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
