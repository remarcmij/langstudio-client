import { Injectable } from '@angular/core'
import { Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import * as LRU from 'lru-cache'
import * as groupBy from 'lodash.groupby'
import * as uniq from 'lodash.uniq'

import { Lemma } from '../lemma.model'
import { AuthService } from '../../core'
import { HttpHelperService } from '../../core/http-helper.service'
import { LanguageService } from '../services/language.service'
import { environment } from '../../../environments/environment'

export interface Paragraph {
  _id: string
  word: string
  wordLang: string
  content: string
  baseLang: string
  targetLang: string
  groupName: string
  _topic: string
}

export interface WordLang {
  word: string
  lang: string
}

export interface DictPopoverParams extends WordLang {
  top: number
  height: number
}

export interface SearchRequest {
  word: string
  lang: string
  attr?: string
  chunk: number
}

export interface LemmaOrderedMap {
  bases: string[]
  lemmas: { [base: string]: Lemma[] }
}

export class LemmaSearchResult {
  baseMap: LemmaOrderedMap = {
    bases: [],
    lemmas: {}
  }

  haveMore = false

  get bases() {
    return this.baseMap.bases
  }

  lemmas(base: string): Lemma[] {
    return this.baseMap.lemmas[base]
  }
}

export interface DictSearchResponse {
  lemmas: Lemma[]
  haveMore: boolean
}

export interface PopoverResponse {
  baseWords: string[]
  resolvedWord: string
  targetLang: string
  text: string
}

@Injectable()
export class SearchApiService {

  readonly showPopover = new Subject<DictPopoverParams>()
  readonly searchSubject = new BehaviorSubject<WordLang>(null)

  private readonly _lemmaCache = LRU<LemmaSearchResult>({ max: 200, maxAge: 1000 * 60 * 60 })
  private readonly _paraCache = LRU<any>({ max: 500, maxAge: 1000 * 60 * 60 })
  private readonly _autoCompleteCache = LRU<WordLang[]>({ max: 500, maxAge: 1000 * 60 * 60 })

  constructor(
    private http: Http,
    private helper: HttpHelperService,
    private auth: AuthService,
    private language: LanguageService
  ) {
  }

  searchParagraphs(searchRequest: SearchRequest) {
    const key = JSON.stringify(searchRequest)
    const searchResult = this._paraCache.get(key)
    if (searchResult) {
      return Observable.of(searchResult)
    }

    return this._handleParaSearchRequest(searchRequest)
      .do((result: any) => this._paraCache.set(key, result))
      .catch(this.helper.handleError)
  }

  searchLemmas(baseResult: LemmaSearchResult, searchRequest: SearchRequest): Observable<LemmaSearchResult> {
    const key = JSON.stringify(searchRequest)
    const searchResult = this._lemmaCache.get(key)
    if (searchResult) {
      return Observable.of(searchResult)
    }

    return this._handleLemmaSearchRequest(searchRequest)
      .map(resp => this._makeSearchResult(resp))
      .map(newResult => this._mergeSearchResult(baseResult, newResult))
      .do((result: LemmaSearchResult) => this._lemmaCache.set(key, result))
      .catch(this.helper.handleError)
  }

  autoCompleteSearch(term: string): Observable<WordLang[]> {
    const items = this._autoCompleteCache.get(term)
    if (items) {
      return Observable.of(items)
    }
    const search = new URLSearchParams()
    search.set('term', term)
    const options = this.helper.getRequestOptions(search)
    return this.http.get(`${environment.api.host}${environment.api.path}/search/autocomplete`, options)
      .map(res => res.json())
      .do((result: WordLang[]) => this._autoCompleteCache.set(term, result))
      .catch(this.helper.handleError)
  }

  popoverSearch(word: string, lang: string): Observable<PopoverResponse> {
    const helper = this.language.getLangHelper(lang)
    const variations = helper.getWordVariations(word)
    const sr: SearchRequest = {
      word: variations.join(','),
      lang: lang,
      attr: 'k',
      chunk: -1
    }
    return this._handleLemmaSearchRequest(sr)
      .map(res => {
        if (!res || res.lemmas.length === 0) {
          return
        }
        return this._makePopoverResponse(res, lang)
      })
  }

  private _makeSearchResult(response: DictSearchResponse): LemmaSearchResult {
    const result = new LemmaSearchResult()
    result.haveMore = response.haveMore

    result.baseMap = response.lemmas.reduce<LemmaOrderedMap>((map, lemma) => {
      const base = lemma.base
      if (!map.lemmas[base]) {
        map.lemmas[base] = []
        map.bases.push(base)
      }
      map.lemmas[base].push(lemma)
      return map
    }, result.baseMap)

    return result
  }

  private _mergeSearchResult(result: LemmaSearchResult, newResult: LemmaSearchResult): LemmaSearchResult {
    result.haveMore = newResult.haveMore

    newResult.baseMap.bases.forEach(base => {
      const newLemmas = newResult.baseMap.lemmas[base]
      const oldLemmas = result.baseMap.lemmas[base]
      if (!oldLemmas) {
        result.baseMap.lemmas[base] = newLemmas
        result.bases.push(base)
      } else {
        result.baseMap.lemmas[base] = oldLemmas.concat(newLemmas)
      }
    })

    return result
  }


  private _makePopoverResponse(resp: DictSearchResponse, lang: string): PopoverResponse {

    const homonymMap: { [key: string]: Lemma[] } = groupBy(resp.lemmas, (lemma: Lemma) => `${lemma.base}.${lemma.homonym}`)

    const homonyms = Object.keys(homonymMap).map(key => {
      let first = true
      const texts = homonymMap[key].map(lemma => {
        const text = lemma.text.trim()
        if (first) {
          first = false
          return text
        }
        // remove redudant keyword prefix
        const regexp = new RegExp(`\\*\\*${lemma.word}\\*\\*, *(\\d+)`)
        return text.replace(regexp, '$1')
      })
      return '<div class=\'my-homonym\'>' + texts.join(' ').replace(/;$/, '.') + '</div>'
    })

    const baseWords = uniq(resp.lemmas.map(lemmaData => lemmaData.base))

    return {
      baseWords,
      resolvedWord: resp.lemmas[0].word,
      targetLang: lang,
      text: homonyms.join('')
    }
  }

  private _handleLemmaSearchRequest(sr: SearchRequest): Observable<DictSearchResponse> {
    const search = new URLSearchParams()
    search.set('word', sr.word)
    if (sr.attr === 'k') {
      search.set('attr', sr.attr)
    }
    search.set('chunk', sr.chunk.toString())
    search.set('lang', sr.lang)
    const options = this.helper.getRequestOptions(search)

    let url = `${environment.api.host}${environment.api.path}/search/dict`
    if (this.auth.token) {
      url += '/auth'
    }

    return this.http.get(url, options)
      .map((res: Response) => res.json())
      .catch(this.helper.handleError)
  }

  private _handleParaSearchRequest(sr: SearchRequest): Observable<any> {
    const search = new URLSearchParams()
    search.set('word', sr.word)
    search.set('attr', sr.attr)
    search.set('chunk', sr.chunk.toString())
    search.set('lang', sr.lang)
    const options = this.helper.getRequestOptions(search)

    let url = `${environment.api.host}${environment.api.path}/search/para`
    if (this.auth.token) {
      url += '/auth'
    }

    return this.http.get(url, options)
      .map((res: Response) => res.json())
      .catch(this.helper.handleError)
  }

}
