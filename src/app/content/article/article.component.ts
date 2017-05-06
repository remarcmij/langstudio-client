import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import * as equal from 'deep-equal'

import { Article, AnchorInfo } from './article.model'
import { DictPopoverInput } from '../../dictionary/dict-popover/dict-popover.component'
import { ContentService } from '../content.service'
import { ContentHttpService } from '../contentHttp.service'
import { SpeechSynthesizer } from '../../core'
import * as myUtil from '../../core'
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
  subscriptions$: Subscription[] = []

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone,
    private contentService: ContentService,
    private httpService: ContentHttpService,
    private speechSynthesizer: SpeechSynthesizer,
    private navigationService: NavigationService,
    private flashCardService: FlashCardService
  ) {
  }

  ngOnInit() {
    this.article = this.route.snapshot.data['article']
    this.hidePopover()

    const sub1$ = this.navigationService.popTopEmitter
      .subscribe((scrollState: string) => this.scrollState = scrollState)
    this.subscriptions$.push(sub1$)

    const params = this.route.snapshot.params
    this.scrollState = 'busy'
    this.publication = params['publication']
    this.chapter = params['chapter']
    this.tag = params['tag']
    this.hasFlashCards = this.flashCardService.hasFlashCards(this.article)
    if (!this.tag) {
      this.navigationService.restoreTop(SELECTOR)
    }

    const sub2$ = this.contentService.handleKeyUp(() => this.onAction('search'))
    this.subscriptions$.push(sub2$)

    this.changeDetector.markForCheck()
  }

  ngOnDestroy() {
    this.subscriptions$.forEach(sub$ => sub$.unsubscribe())
  }

  canDeactivate(): boolean {
    this.navigationService.saveTop(SELECTOR)
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
    if (ev.altKey || this.speechSynthesizer.speechEnabled) {
      if (this.speechSynthesizer.isSynthesisSupported()) {
        let text: string
        if (this.article.foreignLang === this.article.baseLang) {
          text = this.getClickedParagraphText()
        } else {
          const targetElem = <HTMLElement>event.target
          text = targetElem.parentElement.textContent
        }
        this.speechSynthesizer.speakMulti(text, this.article.foreignLang, {
          rate: this.speechSynthesizer.getSpeechRate()
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
          text = myUtil.cleanseTerm(text)
          const top = myUtil.cumulativeTop(target) - document.querySelector('#my-content').scrollTop
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
    this.changeDetector.detectChanges()
  }

  hidePopover() {
    this.popoverInput = undefined
    this.hashTag = undefined
    this.changeDetector.detectChanges()
  }

  wordSearch(word?: string) {
    const params: any = {}
    if (word) {
      params.word = word
    }
    this.router.navigate(['/dictionary', this.article.foreignLang, this.article.baseLang, params])
  }

  speakWord(word: string) {
    this.speechSynthesizer.speakSingle(word, this.article.foreignLang)
  }

  hashTagClicked(hashTag: string) {
    const sub$ = this.httpService.getHashTagItems(hashTag)
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
    this.subscriptions$.push(sub$)
  }

  onAction(action: string) {
    this.sidenavOpen = false
    switch (action) {
      case 'more':
        this.sidenavOpen = true
        console.log('opening')
        break
      case 'back':
        this.router.navigate(['/library', this.publication])
        break
      case 'search':
        this.wordSearch()
        break
      case 'more':
        this.sidepanel.isopen = true
        break
      case 'flashcards':
        this.router.navigate(['/library', this.publication, this.chapter, 'flashcards'])
        break
      case 'toggleSpeech':
        this.speechSynthesizer.speechEnabled = !this.speechSynthesizer.speechEnabled
        break
      case 'allTags':
        this.router.navigate(['/hashtag'])
        break
    }
  }

  acceptAnchors(anchors: AnchorInfo[]) {
    this.anchors = anchors
  }

  private getClickedParagraphText(): string {
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
