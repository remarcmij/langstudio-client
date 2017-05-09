import { Injectable } from '@angular/core'
import { Http, Response, URLSearchParams } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'
import * as LRU from 'lru-cache'
import * as groupBy from 'lodash.groupby'
import * as uniq from 'lodash.uniq'

import { Lemma } from './lemma-group/lemma.model'
import { AuthService } from '../core'
import { LanguageManager } from '../language/lang-helper-manager'
import { environment } from '../../environments/environment'

export interface SearchRequest {
  word: string
  lang?: string
  attr: string
  chunk: number
}

export interface LemmaOrderedMap {
  bases: string[]
  lemmas: { [base: string]: Lemma[] }
}

export class SearchResult {
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

export interface WordLang {
  word: string
  lang: string
}

export interface DictSearchResponse {
  lemmas: Lemma[]
  haveMore: boolean
}

export interface PopoverResponse {
  baseWords: string[]
  resolvedWord: string
  foreignLang: string
  text: string
}

@Injectable()
export class DictionaryHttp {

  private readonly _searchWordCache = LRU<SearchResult>({ max: 500, maxAge: 1000 * 60 * 60 })
  private readonly _autoCompleteCache = LRU<WordLang[]>({ max: 500, maxAge: 1000 * 60 * 60 })

  constructor(
    private _http: Http,
    private _authHttp: AuthHttp,
    private _authService: AuthService,
    private _languageManager: LanguageManager
  ) {
  }

  searchWord(baseResult: SearchResult, searchRequest: SearchRequest): Observable<SearchResult> {
    const key = JSON.stringify(searchRequest)
    const searchResult = this._searchWordCache.get(key)
    if (searchResult) {
      return Observable.of(searchResult)
    }

    return this._sendSearchRequest(searchRequest)
      .map(resp => this._makeSearchResult(resp))
      .map(newResult => this._mergeSearchResult(baseResult, newResult))
      .do((result: SearchResult) => this._searchWordCache.set(key, result))
      .catch(this._handleError)
  }

  autoCompleteSearch(term: string): Observable<WordLang[]> {
    const items = this._autoCompleteCache.get(term)
    if (items) {
      return Observable.of(items)
    }
    const search = new URLSearchParams()
    search.set('term', term)
    return this._http.get(`${environment.api.host}${environment.api.path}/search/autocomplete`, { search })
      .map(res => res.json())
      .do((result: WordLang[]) => this._autoCompleteCache.set(term, result))
      .catch(this._handleError)
  }

  popoverSearch(word: string, lang: string): Observable<PopoverResponse> {
    const helper = this._languageManager.getLangHelper(lang)
    const variations = helper.getWordVariations(word)
    const sr: SearchRequest = {
      word: variations.join(','),
      lang: lang,
      attr: 'k',
      chunk: -1
    }
    return this._sendSearchRequest(sr)
      .map(res => {
        if (!res || res.lemmas.length === 0) {
          return
        }
        return this._makePopoverResponse(res, lang)
      })
  }

  private _makeSearchResult(response: DictSearchResponse): SearchResult {
    const result = new SearchResult()
    result.haveMore = response.haveMore

    result.baseMap = response.lemmas.reduce<LemmaOrderedMap>((map, lemma) => {
      const base = lemma.baseWord
      if (!map.lemmas[base]) {
        map.lemmas[base] = []
        map.bases.push(base)
      }
      map.lemmas[base].push(lemma)
      return map
    }, result.baseMap)

    return result
  }

  private _mergeSearchResult(result: SearchResult, newResult: SearchResult): SearchResult {
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

    const homonymMap: { [key: string]: Lemma[] } = groupBy(resp.lemmas, (lemma: Lemma) => `${lemma.baseWord}.${lemma.homonym}`)

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

    const baseWords = uniq(resp.lemmas.map(lemmaData => lemmaData.baseWord))

    return {
      baseWords,
      resolvedWord: resp.lemmas[0].word,
      foreignLang: lang,
      text: homonyms.join('')
    }
  }

  private _sendSearchRequest(sr: SearchRequest): Observable<DictSearchResponse> {
    const [httpProvider, authed] = this._authService.isTokenValid()
      ? [this._authHttp, 'authed']
      : [this._http, 'public']

    const search = new URLSearchParams()
    search.set('word', sr.word)
    search.set('attr', sr.attr)
    search.set('chunk', sr.chunk.toString())
    if (sr.lang) {
      search.set('lang', sr.lang)
    }

    return httpProvider.get(`${environment.api.host}${environment.api.path}/search/${authed}`, { search })
      .map((res: Response) => res.json())
      .catch(this._handleError)
  }

  private _handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
