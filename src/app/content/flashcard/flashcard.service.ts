import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import * as flatten from 'lodash.flatten'
import * as shuffle from 'lodash.shuffle'

import { Article } from '../article/article.model'
import { SpeechSynthesizerService } from '../../core'

const LOCAL_STORAGE_KEY = 'flashcards'
const BEGIN_MARKER_REGEXP = /<!-- flashcard -->/
const END_MARKER_REGEXP = /<!-- end-flashcard -->/
const HEADING_REGEXP = /^#+\s*(.*)$/
const FOREIGN_FRAGMENT_REGEXP = /\*\*(.+?)\*\*/
const ALL_FOREIGN_FRAGMENT_REGEXP = /\*\*(.+?)\*\*/g
const UNORDERED_LIST_REGEXP = /^-/m
const PARENTHESIZED_REGEXP = /\(.*?\)/g
const PAUSE_AFTER_PROMPT = 2500
const PAUSE_AFTER_SHOW = 2500
const STANDARD_TICK_DURATION = 200
const MIN_TICKS = 15

export interface Flashcard {
  title: string
  show: boolean
  prompt: FlashcardText,
  answer: FlashcardText
}

export interface FlashcardText {
  text: string,
  lang: string,
  isForeign: boolean
}

interface FlashcardSettings {
  flashcard: {
    order: string
    mode: string
    speed: string
  }
  articles: {
    [fileName: string]: number
  }
}

interface FlashcardSection {
  title: string
  flashCards: FlashcardData[]
}

interface FlashcardData {
  sectionTitle: string
  phrase: string
  translation: string
}

export interface FlashcardCallback {
  (item: Flashcard): void
}

@Injectable()
export class FlashcardService {
  private _article: Article
  private _settings: FlashcardSettings
  private _flashCardData: FlashcardData[]
  private _speechSubscription: Subscription
  private _timerSubscription: Subscription
  private _tickDuration = STANDARD_TICK_DURATION
  private _callback: FlashcardCallback
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
    private speechSynthesizer: SpeechSynthesizerService
  ) { }

  setArticle(article: Article, callback: FlashcardCallback) {
    this._article = article
    this._callback = callback
    this._start()
  }

  setLastIndex(index: number) {
    this.stopCurrent()

    if (index < 0 || index >= this._flashCardData.length * 2) {
      index = 0
    }
    this._lastIndex = index

    const flashCard = this._getFlashCard()

    this._callback(flashCard)

    this.stopCurrent()

    if (this.speechEnabled) {
      this._speechSubscription = this._speak(flashCard)
        .subscribe(() => {
          if (this.autoPlay) {
            this.lastIndex += 1
          }
        }, (err: any) => {
          console.error(`speech error: ${err.message}`)
        })
    } else if (this.autoPlay) {
      const timeout = computeTimeout(flashCard)
      this._timerSubscription = Observable.timer(timeout * this._tickDuration)
        .subscribe(() => {
          this.lastIndex += 1
        })
    }
  }

  getFlashCardCount(): number {
    return this._flashCardData.length
  }

  stop() {
    this.autoPlay = false
    this.stopCurrent()
    this.saveSettings()
  }

  hasFlashCards(article: Article): boolean {
    return article.rawBody && article.rawBody.indexOf(`<!-- flashcard -->`) !== -1
  }

  stopCurrent() {
    if (this._speechSubscription) {
      this._speechSubscription.unsubscribe()
      this._speechSubscription = undefined
    }
    if (this._timerSubscription) {
      this._timerSubscription.unsubscribe()
      this._timerSubscription = undefined
    }
  }

  private _start() {
    this._settings = this._getSettings()
    const filenameKey = this._article.fileName.replace(/\W/g, '_')
    const sections = this._getFlashCardSections()
    this._flashCardData = flatten(sections.map(section => section.flashCards))

    let index = this._settings.articles[filenameKey] || 0
    if (this._settings.flashcard.order === 'shuffle') {
      this._flashCardData = shuffle(this._flashCardData)
      index = 0
    }
    index = Math.min(index, (this._flashCardData.length - 1) * 2)
    index = Math.floor(index / 2) * 2

    // start things rolling
    this.lastIndex = index
  }

  private _getFlashCard(): Flashcard {
    const data = this._flashCardData[Math.floor(this.lastIndex / 2)]
    let flashCard: Flashcard
    const show = this.lastIndex % 2 !== 0
    const mode = this._settings.flashcard.mode
    if (mode === 'baseFirst') {
      flashCard = {
        title: data.sectionTitle,
        show,
        prompt: {
          text: data.translation,
          lang: this._article.baseLang,
          isForeign: false
        },
        answer: {
          text: data.phrase,
          lang: this._article.targetLang,
          isForeign: true
        }
      }
    } else {
      flashCard = {
        title: data.sectionTitle,
        show,
        prompt: {
          text: data.phrase,
          lang: this._article.targetLang,
          isForeign: true
        },
        answer: {
          text: data.translation,
          lang: this._article.baseLang,
          isForeign: false
        }
      }
    }

    return flashCard
  }

  private _speak(flashCard: Flashcard): Observable<void> {
    const foreignRate = this.speechSynthesizer.getSpeechRate()
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
      let pause = flashCard.show ? PAUSE_AFTER_SHOW : PAUSE_AFTER_PROMPT
      pause = pause * this._tickDuration / STANDARD_TICK_DURATION
      observable$ = observable$.delay(pause)
    }

    return observable$
  }

  private _getFlashCardSections(): FlashcardSection[] {
    const sections: FlashcardSection[] = []
    let text = this._article.rawBody
    let match = text.match(BEGIN_MARKER_REGEXP)

    while (match) {
      // strip off all textup to and including the begin marker
      text = text.slice(match.index + match[0].length)

      match = text.match(END_MARKER_REGEXP)
      if (match) {
        text = text.slice(0, match.index)
        const lines = text.split('\n')
        const isUnorderedList = UNORDERED_LIST_REGEXP.test(text)
        const section = isUnorderedList
          ? this.getUnorderListFlashCardSection(lines)
          : this.getSingleLineFlashCardSection(lines)
        if (section && section.flashCards.length > 0) {
          sections.push(section)
        }
      }

      match = text.match(BEGIN_MARKER_REGEXP)
    }

    return sections
  }

  private _getSettings(): FlashcardSettings {
    const json = localStorage.getItem(LOCAL_STORAGE_KEY)
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

  private saveSettings() {
    const filenameKey = this._article.fileName.replace(/\W/g, '_')
    this._settings.articles[filenameKey] = this._lastIndex
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this._settings))
  }

  private getSingleLineFlashCardSection(lines: string[]): FlashcardSection {
    let title: string = null // TODO: title is unused
    let section: FlashcardSection

    for (const line of lines) {
      let foreignText: string
      let nativeText: string

      let match = line.match(HEADING_REGEXP)

      if (match) {
        if (!title) {
          section = {
            title: match[1],
            flashCards: []
          }
        }
      } else {
        match = FOREIGN_FRAGMENT_REGEXP.exec(line)
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

  private getUnorderListFlashCardSection(lines: string[]): FlashcardSection {
    let title: string
    let section: FlashcardSection

    let i = 0
    const len = lines.length

    while (i < len) {
      let line = lines[i].replace(PARENTHESIZED_REGEXP, '')
      i += 1

      const match = line.match(HEADING_REGEXP)
      if (match) {
        if (!title) {
          section = {
            title: match[1],
            flashCards: []
          }
        }
      } else if (/^-/.test(line)) {
        const prompt = line.substring(1).trim()
        let answer = ''
        while (i < len) {
          line = lines[i]
          i += 1
          if (line.trim().length === 0 || /^\s/.test(line)) {
            break
          }
          line = line.replace(PARENTHESIZED_REGEXP, '').trim()
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
        if (FOREIGN_FRAGMENT_REGEXP.test(prompt)) {
          foreignText = prompt.replace(ALL_FOREIGN_FRAGMENT_REGEXP, '$1')
          nativeText = answer.replace(ALL_FOREIGN_FRAGMENT_REGEXP, '$1')
        } else {
          foreignText = answer.replace(ALL_FOREIGN_FRAGMENT_REGEXP, '$1')
          nativeText = prompt.replace(ALL_FOREIGN_FRAGMENT_REGEXP, '$1')
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

function computeTimeout(exercisePair: Flashcard): number {
  const phraseWordCount = exercisePair.prompt.text.split(' ').length
  const translationWordCount = exercisePair.answer.text.split(' ').length
  const wordCount = Math.max(phraseWordCount, translationWordCount)
  return MIN_TICKS + Math.round(10 * Math.log(Math.min(wordCount, 5)))
}
