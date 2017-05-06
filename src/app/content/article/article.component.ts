import { Component, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef, NgZone } from '@angular/core'
import { Router } from '@angular/router'
import { ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import * as equal from 'deep-equal'

import { Article, AnchorInfo } from './article.model'
import { DictPopoverInput } from '../../dictionary/dict-popover.component'
import { ContentService } from '../content.service'
import { ContentHttpService } from '../contentHttp.service'
import { SpeechService } from '../../core'
import { UtilityService } from '../../core'
import { NavigationService } from '../../core'
import { CanComponentDeactivate } from '../../core'
import { FlashCardService } from '../flashcard/flashcard.service'
import { NavButton } from '../../shared'

const scrollTopKey = 'article'

@Component({
    selector: 'my-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy, AfterViewChecked, CanComponentDeactivate {
    article: Article
    publication: string
    chapter: string
    tag: string
    hashTag: string
    popoverInput: DictPopoverInput
    scrollState = 'busy'
    articleClass: string
    sidepanel: { isopen: boolean } = { isopen: false }
    anchors: AnchorInfo[] = []

    private combinedSubscription = new Subscription()
    private navButtons: NavButton[] = []
    private hasFlashCards = false

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        private libraryService: ContentService,
        private httpService: ContentHttpService,
        private speechService: SpeechService,
        private utilityService: UtilityService,
        private navigationService: NavigationService,
        private flashCardService: FlashCardService
    ) {
        this.articleClass = this.utilityService.isSmallWidth()
            ? 'mb-1'
            : 'my-1 border md-whiteframe-3dp'
    }

    ngOnInit(): void {
        let subscription: Subscription

        this.updateNavButtons()

        subscription = this.navigationService.popTopEmitter
            .subscribe((scrollState: string) => this.scrollState = scrollState)
        this.combinedSubscription.add(subscription)

        subscription = this.route.params
            .mergeMap(params => {
                this.hidePopover()
                this.scrollState = 'busy'
                this.publication = params['publication']
                this.chapter = params['chapter']
                this.tag = params['tag']
                return this.httpService
                    .getArticle(this.publication, this.chapter)
            }).subscribe(article => {
                this.article = article
                this.hasFlashCards = this.flashCardService.hasFlashCards(this.article)
                this.updateNavButtons()
                if (!this.tag) {
                    this.navigationService.restoreTop(scrollTopKey)
                }
                this.cdr.markForCheck()
            }, (err: Response) => {
                if (err.status === 401) {
                    this.router.navigate(['/signin'])
                } else {
                    window.alert(`Network Error: ${err.statusText}`)
                }
            })
        this.combinedSubscription.add(subscription)

        subscription = this.libraryService.handleKeyUp(() => this.commandHandler('search'))
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }

    canDeactivate(): boolean {
        this.navigationService.saveTop(scrollTopKey)
        return true
    }

    ngAfterViewChecked(): void {
        let element = document.getElementById('anchor')
        if (element && this.tag) {
            element.removeAttribute('id')
            let parent = element.parentElement
            while (parent.tagName !== 'ARTICLE') {
                element = parent
                parent = element.parentElement
            }
            let headerElement = element.previousElementSibling
            if (headerElement && /^H/.test(headerElement.tagName) && headerElement.id) {
                this.jumpToAnchor(headerElement.id)
            }
            setTimeout(() => {
                this.scrollState = 'ready'
            })
        }
    }

    jumpToHashTag(): void {
        if (this.tag) {
            this.zone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.zone.run(() => {
                        let element = <HTMLElement>document.getElementById('hashtag0')
                        let parent = element.parentElement
                        while (parent.tagName !== 'ARTICLE') {
                            element = parent
                            parent = element.parentElement
                        }
                        let headerElement = <HTMLElement>element.previousElementSibling
                        if (headerElement && /^H/.test(headerElement.tagName) && headerElement.id) {
                            this.jumpToAnchor(headerElement.id)
                        }
                        this.scrollState = 'ready'
                    })
                }, 250)
            })
        }
    }

    jumpToAnchor(name: string) {
        this.sidepanel.isopen = false
        let element = <HTMLElement>document.getElementById(name)
        if (element) {
            element.scrollIntoView()
            document.body.scrollTop -= 64
        }
    }

    onClick(ev: MouseEvent): void {
        if (ev.altKey || this.speechService.speechEnabled) {
            if (this.speechService.isSynthesisSupported()) {
                let text: string
                if (this.article.foreignLang === this.article.baseLang) {
                    text = this.getClickedParagraphText()
                } else {
                    let targetElem = <HTMLElement>event.target
                    text = targetElem.parentElement.textContent
                }
                let subscription = this.speechService.speakMulti(text, this.article.foreignLang, {
                    rate: this.speechService.getSpeechRate()
                }).subscribe()
                this.combinedSubscription.add(subscription)
            }
        } else {
            let target = <HTMLElement>ev.target
            if (target.tagName === 'SPAN') {
                ev.preventDefault()
                ev.stopPropagation()
                let text = target.innerText.trim()
                if (/^#/.test(text)) {
                    this.hashTagClicked(text.slice(1).trim())
                } else {
                    text = this.utilityService.cleanseTerm(text)
                    let top = this.utilityService.cumulativeTop(target) - document.body.scrollTop
                    let style = window.getComputedStyle(target)
                    let height = parseInt(style.getPropertyValue('line-height'), 10)
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
        this.cdr.detectChanges()
    }

    hidePopover(): void {
        this.popoverInput = undefined
        this.hashTag = undefined
        this.cdr.detectChanges()
    }

    wordSearch(word: string = undefined): void {
        let params: any = {}
        if (word) {
            params.word = word
        }
        this.router.navigate(['/dictionary', this.article.foreignLang, this.article.baseLang, params])
    }

    speakWord(word: string): void {
        let subscription = this.speechService.speakSingle(word, this.article.foreignLang)
            .subscribe()
        this.combinedSubscription.add(subscription)
    }

    hashTagClicked(hashTag: string): void {
        let subscription = this.httpService.getHashTagItems(hashTag)
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
        this.combinedSubscription.add(subscription)
    }

    commandHandler(command: string): void {
        this.sidepanel.isopen = false

        switch (command) {

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
                this.speechService.speechEnabled = !this.speechService.speechEnabled
                break

            case 'allTags':
                this.router.navigate(['/hashtag'])
                break

            default:
                console.error(`unknown command: ${command}`)
        }
    }

    acceptAnchors(anchors: AnchorInfo[]) {
        this.anchors = anchors
    }

    private updateNavButtons(): void {
        let buttons: NavButton[] = []
        buttons.push({ faName: 'fa-search', command: 'search' })
        buttons.push({ faName: 'fa-ellipsis-h', command: 'more' })
        if (!equal(this.navButtons, buttons, { strict: true })) {
            this.navButtons = buttons
        }
    }

    private getClickedParagraphText(): string {
        let s = window.getSelection()
        let range = s.getRangeAt(0)
        let node = s.anchorNode
        let nodeLength = node.textContent.length

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
