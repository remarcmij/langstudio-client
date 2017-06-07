declare const speechSynthesis: any
declare const SpeechSynthesisUtterance: any

import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'
import { Subscription } from 'rxjs/Subscription'

export interface SpeechSynthesisVoice {
  voiceURI: string
  name: string
  lang: string
  localService?: boolean
  'default'?: boolean
}

interface PreferredVoiceURI {
  lang: string
  voiceURI: string
}

const preferredVoices: PreferredVoiceURI[] = [
  { lang: 'nl', voiceURI: 'Xander' },
  { lang: 'nl', voiceURI: 'com.apple.speech.synthesis.voice.xander' },
  { lang: 'nl', voiceURI: 'com.apple.ttsbundle.Xander-premium' }, // iPad
  { lang: 'nl', voiceURI: 'com.apple.ttsbundle.Xander-compact' }, // iPad
  { lang: 'nl', voiceURI: 'nl-NL' },

  { lang: 'id', voiceURI: 'Damayanti' },
  { lang: 'id', voiceURI: 'com.apple.speech.synthesis.voice.damayanti.premium' },
  { lang: 'id', voiceURI: 'com.apple.ttsbundle.Damayanti-premium' }, // iPad
  { lang: 'id', voiceURI: 'com.apple.ttsbundle.Damayanti-compact' }, // iPad

  { lang: 'ar', voiceURI: 'Maged' },
  { lang: 'ar', voiceURI: 'com.apple.speech.synthesis.voice.maged.premium' },
  { lang: 'ar', voiceURI: 'com.apple.ttsbundle.Maged-compact' },  // iPad
  { lang: 'ar', voiceURI: 'ar-SA' }
]

export interface SelectedVoicesMap {
  [lang: string]: string
}

export interface SpeechSettings {
  rate: number
  preferredVoices: SelectedVoicesMap
}

// mapping of non-standard (Android) language codes to standard ISO codes

const ANDROID_LANG_MAPPINGS: { [code: string]: string } = {
  'bn_BD': 'bn-BD',
  'da_DK': 'da-DK',
  'de_DE': 'de-DE',
  'en_AU': 'en-AU',
  'en_GB': 'en-GB',
  'en_IN': 'en-IN',
  'en_US': 'en-US',
  'es_ES': 'es-ES',
  'es_MX': 'es-MX',
  'es_US': 'es-US',
  'fi_FI': 'fi-FI',
  'fr_BE': 'fr-BE',
  'fr_FR': 'fr-FR',
  'hi_IN': 'hi-IN',
  'hu_HU': 'hu-HU',
  'in_ID': 'id-ID',
  'it_IT': 'it-IT',
  'ja_JP': 'ja-JP',
  'ko_KR': 'ko-KR',
  'nb_NO': 'nb-NO',
  'nl_NL': 'nl-NL',
  'pl_PL': 'pl-PL',
  'pt_BR': 'pt-BR',
  'pt_PT': 'pt-PT',
  'ru_RU': 'ru-RU',
  'th_TH': 'th-TH',
  'tr_TR': 'tr-TR',
  'zh_CN_#Hans': 'zh-CN',
  'zh_TW_#Hant': 'zh-TW'
}

const IOS8_VOICES: SpeechSynthesisVoice[] = [
  { name: 'he-IL', voiceURI: 'he-IL', lang: 'he-IL' },
  { name: 'th-TH', voiceURI: 'th-TH', lang: 'th-TH' },
  { name: 'pt-BR', voiceURI: 'pt-BR', lang: 'pt-BR' },
  { name: 'sk-SK', voiceURI: 'sk-SK', lang: 'sk-SK' },
  { name: 'fr-CA', voiceURI: 'fr-CA', lang: 'fr-CA' },
  { name: 'ro-RO', voiceURI: 'ro-RO', lang: 'ro-RO' },
  { name: 'no-NO', voiceURI: 'no-NO', lang: 'no-NO' },
  { name: 'fi-FI', voiceURI: 'fi-FI', lang: 'fi-FI' },
  { name: 'pl-PL', voiceURI: 'pl-PL', lang: 'pl-PL' },
  { name: 'de-DE', voiceURI: 'de-DE', lang: 'de-DE' },
  { name: 'nl-NL', voiceURI: 'nl-NL', lang: 'nl-NL' },
  { name: 'id-ID', voiceURI: 'id-ID', lang: 'id-ID' },
  { name: 'tr-TR', voiceURI: 'tr-TR', lang: 'tr-TR' },
  { name: 'it-IT', voiceURI: 'it-IT', lang: 'it-IT' },
  { name: 'pt-PT', voiceURI: 'pt-PT', lang: 'pt-PT' },
  { name: 'fr-FR', voiceURI: 'fr-FR', lang: 'fr-FR' },
  { name: 'ru-RU', voiceURI: 'ru-RU', lang: 'ru-RU' },
  { name: 'es-MX', voiceURI: 'es-MX', lang: 'es-MX' },
  { name: 'zh-HK', voiceURI: 'zh-HK', lang: 'zh-HK' },
  { name: 'sv-SE', voiceURI: 'sv-SE', lang: 'sv-SE' },
  { name: 'hu-HU', voiceURI: 'hu-HU', lang: 'hu-HU' },
  { name: 'zh-TW', voiceURI: 'zh-TW', lang: 'zh-TW' },
  { name: 'es-ES', voiceURI: 'es-ES', lang: 'es-ES' },
  { name: 'zh-CN', voiceURI: 'zh-CN', lang: 'zh-CN' },
  { name: 'nl-BE', voiceURI: 'nl-BE', lang: 'nl-BE' },
  { name: 'en-GB', voiceURI: 'en-GB', lang: 'en-GB' },
  { name: 'ar-SA', voiceURI: 'ar-SA', lang: 'ar-SA' },
  { name: 'ko-KR', voiceURI: 'ko-KR', lang: 'ko-KR' },
  { name: 'cs-CZ', voiceURI: 'cs-CZ', lang: 'cs-CZ' },
  { name: 'en-ZA', voiceURI: 'en-ZA', lang: 'en-ZA' },
  { name: 'en-AU', voiceURI: 'en-AU', lang: 'en-AU' },
  { name: 'da-DK', voiceURI: 'da-DK', lang: 'da-DK' },
  { name: 'en-US', voiceURI: 'en-US', lang: 'en-US' },
  { name: 'en-IE', voiceURI: 'en-IE', lang: 'en-IE' },
  { name: 'hi-IN', voiceURI: 'hi-IN', lang: 'hi-IN' },
  { name: 'el-GR', voiceURI: 'el-GR', lang: 'el-GR' },
  { name: 'ja-JP', voiceURI: 'ja-JP', lang: 'ja-JP' }
]

const IOS9_VOICES: SpeechSynthesisVoice[] = [
  { name: 'Maged', voiceURI: 'com.apple.ttsbundle.Maged-compact', lang: 'ar-SA', localService: true, 'default': true },
  { name: 'Zuzana', voiceURI: 'com.apple.ttsbundle.Zuzana-compact', lang: 'cs-CZ', localService: true, 'default': true },
  { name: 'Sara', voiceURI: 'com.apple.ttsbundle.Sara-compact', lang: 'da-DK', localService: true, 'default': true },
  { name: 'Anna', voiceURI: 'com.apple.ttsbundle.Anna-compact', lang: 'de-DE', localService: true, 'default': true },
  { name: 'Melina', voiceURI: 'com.apple.ttsbundle.Melina-compact', lang: 'el-GR', localService: true, 'default': true },
  { name: 'Karen', voiceURI: 'com.apple.ttsbundle.Karen-compact', lang: 'en-AU', localService: true, 'default': true },
  { name: 'Daniel', voiceURI: 'com.apple.ttsbundle.Daniel-compact', lang: 'en-GB', localService: true, 'default': true },
  { name: 'Moira', voiceURI: 'com.apple.ttsbundle.Moira-compact', lang: 'en-IE', localService: true, 'default': true },
  { name: 'Samantha (Enhanced)', voiceURI: 'com.apple.ttsbundle.Samantha-premium', lang: 'en-US', localService: true, 'default': true },
  { name: 'Samantha', voiceURI: 'com.apple.ttsbundle.Samantha-compact', lang: 'en-US', localService: true, 'default': true },
  { name: 'Tessa', voiceURI: 'com.apple.ttsbundle.Tessa-compact', lang: 'en-ZA', localService: true, 'default': true },
  { name: 'Monica', voiceURI: 'com.apple.ttsbundle.Monica-compact', lang: 'es-ES', localService: true, 'default': true },
  { name: 'Paulina', voiceURI: 'com.apple.ttsbundle.Paulina-compact', lang: 'es-MX', localService: true, 'default': true },
  { name: 'Satu', voiceURI: 'com.apple.ttsbundle.Satu-compact', lang: 'fi-FI', localService: true, 'default': true },
  { name: 'Amelie', voiceURI: 'com.apple.ttsbundle.Amelie-compact', lang: 'fr-CA', localService: true, 'default': true },
  { name: 'Thomas', voiceURI: 'com.apple.ttsbundle.Thomas-compact', lang: 'fr-FR', localService: true, 'default': true },
  { name: 'Carmit', voiceURI: 'com.apple.ttsbundle.Carmit-compact', lang: 'he-IL', localService: true, 'default': true },
  { name: 'Lekha', voiceURI: 'com.apple.ttsbundle.Lekha-compact', lang: 'hi-IN', localService: true, 'default': true },
  { name: 'Mariska', voiceURI: 'com.apple.ttsbundle.Mariska-compact', lang: 'hu-HU', localService: true, 'default': true },
  { name: 'Damayanti', voiceURI: 'com.apple.ttsbundle.Damayanti-compact', lang: 'id-ID', localService: true, 'default': true },
  { name: 'Alice', voiceURI: 'com.apple.ttsbundle.Alice-compact', lang: 'it-IT', localService: true, 'default': true },
  { name: 'Kyoko', voiceURI: 'com.apple.ttsbundle.Kyoko-compact', lang: 'ja-JP', localService: true, 'default': true },
  { name: 'Yuna', voiceURI: 'com.apple.ttsbundle.Yuna-compact', lang: 'ko-KR', localService: true, 'default': true },
  { name: 'Ellen', voiceURI: 'com.apple.ttsbundle.Ellen-compact', lang: 'nl-BE', localService: true, 'default': true },
  { name: 'Xander', voiceURI: 'com.apple.ttsbundle.Xander-compact', lang: 'nl-NL', localService: true, 'default': true },
  { name: 'Nora', voiceURI: 'com.apple.ttsbundle.Nora-compact', lang: 'no-NO', localService: true, 'default': true },
  { name: 'Zosia', voiceURI: 'com.apple.ttsbundle.Zosia-compact', lang: 'pl-PL', localService: true, 'default': true },
  { name: 'Luciana', voiceURI: 'com.apple.ttsbundle.Luciana-compact', lang: 'pt-BR', localService: true, 'default': true },
  { name: 'Joana', voiceURI: 'com.apple.ttsbundle.Joana-compact', lang: 'pt-PT', localService: true, 'default': true },
  { name: 'Ioana', voiceURI: 'com.apple.ttsbundle.Ioana-compact', lang: 'ro-RO', localService: true, 'default': true },
  { name: 'Milena', voiceURI: 'com.apple.ttsbundle.Milena-compact', lang: 'ru-RU', localService: true, 'default': true },
  { name: 'Laura', voiceURI: 'com.apple.ttsbundle.Laura-compact', lang: 'sk-SK', localService: true, 'default': true },
  { name: 'Alva', voiceURI: 'com.apple.ttsbundle.Alva-compact', lang: 'sv-SE', localService: true, 'default': true },
  { name: 'Kanya', voiceURI: 'com.apple.ttsbundle.Kanya-compact', lang: 'th-TH', localService: true, 'default': true },
  { name: 'Yelda', voiceURI: 'com.apple.ttsbundle.Yelda-compact', lang: 'tr-TR', localService: true, 'default': true },
  { name: 'Ting-Ting', voiceURI: 'com.apple.ttsbundle.Ting-Ting-compact', lang: 'zh-CN', localService: true, 'default': true },
  { name: 'Sin-Ji', voiceURI: 'com.apple.ttsbundle.Sin-Ji-compact', lang: 'zh-HK', localService: true, 'default': true },
  { name: 'Mei-Jia', voiceURI: 'com.apple.ttsbundle.Mei-Jia-compact', lang: 'zh-TW', localService: true, 'default': true }
]

const MAX_RETRIES = 3
const INTER_SENTENCE_PAUSE_MS = 1000
const LOCAL_STORAGE_KEY = 'speech.settings'
const DEFAULT_RATE = 0.8

export interface SpeakOptions {
  pause?: number
  volume?: number
  rate?: number
}

@Injectable()
export class SpeechSynthesizerService {
  voicesAvailable: SpeechSynthesisVoice[]
  private _hasSpoken = false // needed for iOS
  isCancelling = false
  speechSubscription: Subscription
  utterance: any
  private _speechEnabled = false

  settings: SpeechSettings

  get speechEnabled(): boolean {
    return this._speechEnabled
  }

  set speechEnabled(value: boolean) {
    this._speechEnabled = value
    if (!value) {
      this.cancel()
    }
  }

  constructor(
  ) {
    this.onInit()
  }

  onInit() {
    if (!this.isSynthesisSupported()) {
      return
    }

    this.loadVoices()
      .then(voices => {
        this.voicesAvailable = voices.sort((a, b) => a.lang.localeCompare(b.lang))
        const text = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (text) {
          this.settings = JSON.parse(text)
        } else {
          this.settings = this.defaultSettings()
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.settings))
        }
      })
  }

  defaultSettings(): SpeechSettings {
    const voiceURIs = preferredVoices.reduce((map: SelectedVoicesMap, pv: PreferredVoiceURI) => {
      if (this.voicesAvailable.some(av => av.voiceURI === pv.voiceURI)) {
        map[pv.lang] = pv.voiceURI
      }
      return map
    }, {})

    return {
      rate: DEFAULT_RATE,
      preferredVoices: voiceURIs
    }
  }

  get hasSpoken(): boolean {
    return this._hasSpoken
  }

  loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve, reject) => {
      try {
        let voices: SpeechSynthesisVoice[] = []
        let retries = 0

        if (typeof speechSynthesis === 'undefined') {
          return resolve([])
        }
        voices = speechSynthesis.getVoices()
        if (voices.length !== 0) {
          return resolve(voices)
        }

        const intervalID = setInterval((): void => {
          voices = speechSynthesis.getVoices()
          retries += 1
          if (voices.length !== 0 || retries > MAX_RETRIES) {
            console.log('loadVoices retry ' + retries)
            clearInterval(intervalID)
            if (voices.length === 0 && /(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
              console.log('using cached voices')
              voices = isIOS9() ? IOS9_VOICES : IOS8_VOICES
            }
            return resolve(voices)
          }
        }, 1)
      } catch (err) {
        reject(err)
      }
    })
  }

  isSynthesisSupported(): boolean {
    return typeof speechSynthesis !== 'undefined'
  }

  canSpeakLanguage(lang: string): boolean {
    return this.isSynthesisSupported() && !!this.selectVoice(lang)
  }

  getSpeechRate(): number {
    return this.settings.rate
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voicesAvailable
  }

  cancel() {
    this.isCancelling = true
    speechSynthesis.cancel()
    if (this.speechSubscription) {
      this.speechSubscription.unsubscribe()
      this.speechSubscription = undefined
    }
    if (this.isSynthesisSupported()) {
      speechSynthesis.cancel()
    }
  }

  speakMulti(text: string, lang: string, options?: SpeakOptions): Observable<{}> {
    if (!this.isSynthesisSupported()) {
      throw new Error('speech synthesis not supported')
    }

    options = options || {}
    options.pause = options.pause || 0

    this.cancel()
    this.isCancelling = false

    text = text.trim()
    if (!/[.?!]$/.test(text)) {
      text += '.'
    }
    text += ' '

    const matches = text.match(/.+?[.!?]+\s+/g) || [text]

    if (matches.length > 1) {
      options.pause = options.pause || INTER_SENTENCE_PAUSE_MS
    }

    return Observable.from(matches)
      .map(phrase => phrase.trim())
      .filter(phrase => phrase.length !== 0)
      .concatMap(phrase => this.speakObservable(phrase, lang, options).delay(options.pause))
  }

  speakSingle(text: string, lang: string, options?: SpeakOptions): Observable<{}> {
    if (!this.isSynthesisSupported()) {
      return Observable.throw(new Error('speech synthesis not supported'))
    }
    this.cancel()
    this.isCancelling = false
    return this.speakObservable(text, lang, options)
  }

  speakObservable(text: string, lang: string, options: SpeakOptions = {}): Observable<any> {

    return Observable.create((observer: Observer<any>): any => {

      try {
        const voice = this.selectVoice(lang)

        if (!voice) {
          throw new Error(`voice for '${lang}' not loaded`)
        }

        // use member variable for utterance to prevent
        // erronous garbage collection clean-up
        this.utterance = new SpeechSynthesisUtterance()
        this.utterance.text = text
        this.utterance.voice = voice
        this.utterance.voiceURI = voice.voiceURI
        this.utterance.lang = voice.lang
        this.utterance.rate = options.rate || 1
        this.utterance.volume = (typeof options.volume === 'number') ? options.volume : 1

        const onEndHandler = (e?: any) => {
          this._hasSpoken = true
          observer.next(this.utterance)
          observer.complete()
        }

        this.utterance.addEventListener('end', onEndHandler)

        // Safari fires onerror instead onend while there is no error apparent
        this.utterance.addEventListener('error', onEndHandler)

        speechSynthesis.speak(this.utterance)
      } catch (err) {
        observer.error(err)
      }
    })
  }

  selectVoice(lang: string): SpeechSynthesisVoice {
    const fallbackVoices = this.voicesAvailable
      .filter(voice => voice.lang === lang || !!ANDROID_LANG_MAPPINGS[voice.lang])

    const prefVoiceURI = this.settings.preferredVoices[lang]

    if (prefVoiceURI) {
      return this.voicesAvailable
        .filter(voice => voice.voiceURI === prefVoiceURI)
        .concat(fallbackVoices)[0]
    }

    return fallbackVoices[0]
  }
}

function isIOS9(): boolean {
  const deviceAgent = navigator.userAgent.toLowerCase()
  return /(iphone|ipod|ipad).* os 9_/.test(deviceAgent)
}
