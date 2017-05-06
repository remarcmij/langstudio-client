import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import * as flatten from 'lodash.flatten'
import * as shuffle from 'lodash.shuffle'

import { Article } from '../article/article.model'
import { SpeechSynthesizer } from '../../core'

const localStorageKey = 'flashcards'
const beginMarkerRegExp = /<!-- flashcard -->/
const endMarkerRegExp = /<!-- end-flashcard -->/
const headerRegExp = /^#+\s*(.*)$/
const foreignFragmentRegExp = /\*\*(.+?)\*\*/
const allForeignFragmentRegExp = /\*\*(.+?)\*\*/g
const unorderedListRegExp = /^-/m
const parenthesizedRegExp = /\(.*?\)/g
const pauseAfterPrompt = 2500
const pauseAfterShow = 2500
const standardTickDuration = 200
const minTicks = 15

export interface FlashCard {
    title: string
    show: boolean
    prompt: FlashCardText,
    answer: FlashCardText
}

export interface FlashCardText {
    text: string,
    lang: string,
    isForeign: boolean
}

interface FlashCardSettings {
    flashcard: {
        order: string
        mode: string
        speed: string
    }
    articles: {
        [fileName: string]: number
    }
}

interface FlashCardSection {
    title: string
    flashCards: FlashCardData[]
}

interface FlashCardData {
    sectionTitle: string
    phrase: string
    translation: string
}

export interface FlashCardCallback {
    (item: FlashCard): void
}

@Injectable()
export class FlashCardService {
    private article: Article
    private settings: FlashCardSettings
    private flashCardData: FlashCardData[]
    private speechSubscription: Subscription
    private timerSubscription: Subscription
    private tickDuration = standardTickDuration
    private callback: FlashCardCallback
    private _autoPlay = false
    private _lastIndex = 0

    get speechEnabled(): boolean {
        return this.speechSynthesizer.speechEnabled
    }

    set speechEnabled(value: boolean) {
        this.speechSynthesizer.speechEnabled = value
    }

    get lastIndex(): number {
        return this._lastIndex
    }

    set lastIndex(index: number) {
        this.setLastIndex(index)
    }

    get autoPlay(): boolean {
        return this._autoPlay
    }

    set autoPlay(value: boolean) {
        this._autoPlay = value
        if (value) {
            this.lastIndex = this._lastIndex
        } else {
            this.stopCurrent()
            this.saveSettings()
        }
    }

    constructor(
        private speechSynthesizer: SpeechSynthesizer
    ) {
        this._autoPlay = false
    }

    setArticle(article: Article, callback: FlashCardCallback): void {
        this.article = article
        this.callback = callback
        this.start()
    }

    setLastIndex(index: number) {
        this.stopCurrent()

        if (index < 0 || index >= this.flashCardData.length * 2) {
            index = 0
        }
        this._lastIndex = index

        let flashCard = this.getFlashCard()

        this.callback(flashCard)

        this.stopCurrent()

        if (this.speechEnabled) {
            this.speechSubscription = this.speak(flashCard)
                .subscribe(() => {
                    if (this.autoPlay) {
                        this.lastIndex += 1
                    }
                }, (err: any) => {
                    console.error(`speech error: ${err.message}`)
                })
        } else if (this.autoPlay) {
            let timeout = computeTimeout(flashCard)
            this.timerSubscription = Observable.timer(timeout * this.tickDuration)
                .subscribe(() => {
                    this.lastIndex += 1
                })
        }
    }

    getFlashCardCount(): number {
        return this.flashCardData.length
    }

    stop(): void {
        this.autoPlay = false
        this.stopCurrent()
        this.saveSettings()
    }

    hasFlashCards(article: Article): boolean {
        return article.mdText && article.mdText.indexOf(`<!-- flashcard -->`) !== -1
    }

    stopCurrent(): void {
        if (this.speechSubscription) {
            this.speechSubscription.unsubscribe()
            this.speechSubscription = undefined
        }
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe()
            this.timerSubscription = undefined
        }
    }

    private start(): void {
        this.settings = this.getSettings()
        let filenameKey = this.article.fileName.replace(/\W/g, '_')
        let sections = this.getFlashCardSections()
        this.flashCardData = flatten(sections.map(section => section.flashCards))

        let index = this.settings.articles[filenameKey] || 0
        if (this.settings.flashcard.order === 'shuffle') {
            this.flashCardData = shuffle(this.flashCardData)
            index = 0
        }
        index = Math.min(index, (this.flashCardData.length - 1) * 2)
        index = Math.floor(index / 2) * 2

        // start things rolling
        this.lastIndex = index
    }

    private getFlashCard(): FlashCard {
        let data = this.flashCardData[Math.floor(this.lastIndex / 2)]
        let flashCard: FlashCard
        let show = this.lastIndex % 2 !== 0
        let mode = this.settings.flashcard.mode
        if (mode === 'baseFirst') {
            flashCard = {
                title: data.sectionTitle,
                show,
                prompt: {
                    text: data.translation,
                    lang: this.article.baseLang,
                    isForeign: false
                },
                answer: {
                    text: data.phrase,
                    lang: this.article.foreignLang,
                    isForeign: true
                }
            }
        } else {
            flashCard = {
                title: data.sectionTitle,
                show,
                prompt: {
                    text: data.phrase,
                    lang: this.article.foreignLang,
                    isForeign: true
                },
                answer: {
                    text: data.translation,
                    lang: this.article.baseLang,
                    isForeign: false
                }
            }
        }

        return flashCard
    }

    private speak(flashCard: FlashCard): Observable<void> {
        let foreignRate = this.speechSynthesizer.getSpeechRate()
        let observable$: Observable<any>

        if (flashCard.show) {
            observable$ = this.speechSynthesizer.speakObservable(
                flashCard.answer.text, flashCard.answer.lang, {
                    volume: 1,
                    rate: flashCard.answer.isForeign ? foreignRate : 1
                })
        } else {
            observable$ = this.speechSynthesizer.speakObservable(
                flashCard.prompt.text, flashCard.prompt.lang, {
                    volume: 1,
                    rate: flashCard.prompt.isForeign ? foreignRate : 1
                }).concat(this.speechSynthesizer.speakObservable(
                    flashCard.answer.text, flashCard.answer.lang, {
                        volume: 0,
                        rate: flashCard.answer.isForeign ? foreignRate : 1
                    }))
        }

        if (this.autoPlay) {
            let pause = flashCard.show ? pauseAfterShow : pauseAfterPrompt
            pause = pause * this.tickDuration / standardTickDuration
            observable$ = observable$.delay(pause)
        }

        return observable$
    }

    private getFlashCardSections(): FlashCardSection[] {
        let sections: FlashCardSection[] = []
        let text = this.article.mdText
        let match = text.match(beginMarkerRegExp)

        while (match) {
            // strip off all textup to and including the begin marker
            text = text.slice(match.index + match[0].length)

            match = text.match(endMarkerRegExp)
            if (match) {
                text = text.slice(0, match.index)
                let lines = text.split('\n')
                let isUnorderedList = unorderedListRegExp.test(text)
                let section = isUnorderedList
                    ? this.getUnorderListFlashCardSection(lines)
                    : this.getSingleLineFlashCardSection(lines)
                if (section && section.flashCards.length > 0) {
                    sections.push(section)
                }
            }

            match = text.match(beginMarkerRegExp)
        }

        return sections
    }

    private getSettings(): FlashCardSettings {
        let json = localStorage.getItem(localStorageKey)
        if (json) {
            return JSON.parse(json)
        } else {
            return {
                flashcard: {
                    order: 'article',
                    mode: 'standard',
                    speed: 'standard'
                },
                articles: {}
            }
        }
    }

    private saveSettings(): void {
        let filenameKey = this.article.fileName.replace(/\W/g, '_')
        this.settings.articles[filenameKey] = this._lastIndex
        localStorage.setItem(localStorageKey, JSON.stringify(this.settings))
    }

    private getSingleLineFlashCardSection(lines: string[]): FlashCardSection {
        let title: string
        let section: FlashCardSection

        for (let line of lines) {
            let foreignText: string
            let nativeText: string

            let match = line.match(headerRegExp)

            if (match) {
                if (!title) {
                    section = {
                        title: match[1],
                        flashCards: []
                    }
                }
            } else {
                match = foreignFragmentRegExp.exec(line)
                if (match) {
                    foreignText = match[1]
                    nativeText = line.slice(0, match.index) + line.slice(match.index + match[0].length)
                    if (section) {
                        section.flashCards.push({
                            sectionTitle: section.title,
                            phrase: foreignText.trim(),
                            translation: nativeText.trim()
                        })
                    }
                }
            }
        }

        return section
    }

    private getUnorderListFlashCardSection(lines: string[]): FlashCardSection {
        let title: string
        let section: FlashCardSection

        let i = 0
        let len = lines.length

        while (i < len) {
            let line = lines[i].replace(parenthesizedRegExp, '')
            i += 1

            let match = line.match(headerRegExp)
            if (match) {
                if (!title) {
                    section = {
                        title: match[1],
                        flashCards: []
                    }
                }
            } else if (/^-/.test(line)) {
                let prompt = line.substring(1).trim()
                let answer = ''
                while (i < len) {
                    line = lines[i]
                    i += 1
                    if (line.trim().length === 0 || /^\s/.test(line)) {
                        break
                    }
                    line = line.replace(parenthesizedRegExp, '').trim()
                    if (line.length === 0) {
                        continue
                    }
                    if (answer.length > 0) {
                        answer += '\n'
                    }
                    answer += line
                }

                let foreignText: string
                let nativeText: string
                if (foreignFragmentRegExp.test(prompt)) {
                    foreignText = prompt.replace(allForeignFragmentRegExp, '$1')
                    nativeText = answer.replace(allForeignFragmentRegExp, '$1')
                } else {
                    foreignText = answer.replace(allForeignFragmentRegExp, '$1')
                    nativeText = prompt.replace(allForeignFragmentRegExp, '$1')
                }

                if (section) {
                    section.flashCards.push({
                        sectionTitle: section.title,
                        phrase: foreignText.trim(),
                        translation: nativeText.trim()
                    })
                }
            }
        }

        return section
    }

}

function computeTimeout(exercisePair: FlashCard): number {
    let phraseWordCount = exercisePair.prompt.text.split(' ').length
    let translationWordCount = exercisePair.answer.text.split(' ').length
    let wordCount = Math.max(phraseWordCount, translationWordCount)
    return minTicks + Math.round(10 * Math.log(Math.min(wordCount, 5)))
}
