import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import * as debounce from 'lodash.debounce'
import * as equal from 'deep-equal'

import { Article } from '../article/article.model'
import { ContentHttpService } from '../contentHttp.service'
import { FlashCardService, FlashCard } from './flashcard.service'
import { SpeechSynthesizer } from '../../core'
import { NavButton } from '../../shared'

const keyCodeSpace = 32
const keyCodeBackSpace = 8
const keyCodeLeftArrow = 37
const keyCodeRightArrow = 39
const interceptKeyCodes = [keyCodeSpace, keyCodeBackSpace, keyCodeLeftArrow, keyCodeRightArrow]
const buttonDelay = 200

@Component({
    selector: 'my-flashcard',
    templateUrl: './flashcard.component.html',
    styles: [
        `h5 {
            margin: 4px;
            text-align: center;
        }`,
        `h6 {
            font-size: 12px;
            font-weight: 400;
        }`
    ]
})
export class FlashCardComponent implements OnInit, OnDestroy {
    article: Article
    publication: string
    chapter: string
    flashCard: FlashCard
    sliderIndex = 0

    currentPage = 0
    numPages: number

    private navButtons: NavButton[] = []

    get autoPlay() {
        return this.flashCardService.autoPlay
    }

    set autoPlay(value: boolean) {
        this.flashCardService.autoPlay = value
    }

    private goIndexDebounced: (index: number) => void
    private combinedSubscription = new Subscription()

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private httpService: ContentHttpService,
        private flashCardService: FlashCardService,
        private speechSynthesizer: SpeechSynthesizer
    ) {
        this.goIndexDebounced = debounce(this.goIndex.bind(this), buttonDelay)
    }

    ngOnInit(): void {

        this.updateNavButtons()

        let subscription = this.activatedRoute.params
            .mergeMap(params => {
                this.publication = params['publication']
                this.chapter = params['chapter']
                return this.httpService
                    .getArticle(this.publication, this.chapter)
            }).subscribe(article => {
                this.article = article
                this.updateNavButtons()
                this.flashCardService.setArticle(article, this.flashCardCallback.bind(this))
            }, (err: Response) => {
                if (err.status === 401) {
                    this.router.navigate(['/signin'])
                } else {
                    window.alert(`Network Error: ${err.statusText}`)
                }
            })
        this.combinedSubscription.add(subscription)

        subscription = Observable.fromEvent(document.body, 'keyup')
            .debounceTime(250)
            .filter((ev: KeyboardEvent) => interceptKeyCodes.indexOf(ev.keyCode) !== -1)
            .subscribe((ev: KeyboardEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
                if (ev.keyCode === keyCodeSpace || ev.keyCode === keyCodeRightArrow) {
                    this.goNext()
                } else {
                    this.goPrev()
                }
            })
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
        this.flashCardService.stop()
    }

    goNext(): void {
        if (this.canGoNext()) {
            this.goIndexDebounced(this.flashCardService.lastIndex + 1)
        }
    }

    goLast(): void {
        this.goIndexDebounced(this.flashCardService.getFlashCardCount() * 2 - 1)
    }

    canGoNext(): boolean {
        return this.flashCardService.lastIndex < this.flashCardService.getFlashCardCount() * 2 - 1
    }


    canGoPrev(): boolean {
        return this.flashCardService.lastIndex > 0
    }

    goPrev(): void {
        if (this.canGoPrev()) {
            this.goIndexDebounced(Math.max(this.flashCardService.lastIndex - 1, 0))
        }
    }

    goFirst() {
        this.goIndexDebounced(0)
    }

    goIndex(index: number) {
        this.flashCardService.autoPlay = false
        this.flashCardService.lastIndex = index
    }

    flashCardCallback(flashCard: FlashCard): void {
        this.flashCard = flashCard
        this.sliderIndex = this.flashCardService.lastIndex

        // needed on iOS
        this.changeDetector.detectChanges()
    }

    getFlashCardNumber(): number {
        return Math.floor(this.flashCardService.lastIndex / 2) + 1
    }

    getFlashCardCount(): number {
        return this.flashCardService.getFlashCardCount()
    }

    private updateNavButtons(): NavButton[] {
        let buttons: NavButton[] = []

        if (this.article && this.speechSynthesizer.canSpeakLanguage(this.article.foreignLang)
            && this.speechSynthesizer.canSpeakLanguage(this.article.baseLang)) {
            buttons.push({
                faName: this.flashCardService.speechEnabled ? 'fa-volume-up' : 'fa-volume-off',
                command: this.flashCardService.speechEnabled ? 'speechOff' : 'speechOn'
            })
        }
        buttons.push({
            faName: 'fa-cog',
            command: 'settings'
        })

        if (!equal(this.navButtons, buttons, { strict: true })) {
            this.navButtons = buttons
        }

        return this.navButtons;
    }

    commandHandler(command: string): void {
        switch (command) {

            case 'play':
                this.flashCardService.autoPlay = true
                break

            case 'pause':
                this.flashCardService.autoPlay = false
                break

            case 'speechOff':
                this.flashCardService.speechEnabled = false
                this.updateNavButtons()
                break

            case 'speechOn':
                this.flashCardService.speechEnabled = true
                this.updateNavButtons()
                break

            case 'settings':
                // FIXME: add code
                break

            default:
                throw new Error('unknown NavButton command')
        }
    }
}
