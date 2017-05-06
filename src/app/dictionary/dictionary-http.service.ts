import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'
import * as LRU from 'lru-cache'
import * as groupBy from 'lodash.groupby'
import * as uniq from 'lodash.uniq'

import { Lemma } from './lemma.model'
import { AppConstants } from '../app.constants'
import { AuthService } from '../core'
import { LanguageManager } from '../language/lang-helper-manager'


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

export interface WordLangPair {
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
export class DictionaryHttpService {

    private readonly searchWordCache = LRU<SearchResult>({ max: 500, maxAge: 1000 * 60 * 60 })
    private readonly autoCompleteCache = LRU<WordLangPair[]>({ max: 500, maxAge: 1000 * 60 * 60 })

    constructor(
        private http: Http,
        private authHttp: AuthHttp,
        private authService: AuthService,
        private languageManager: LanguageManager
    ) {
    }

    searchWord(baseResult: SearchResult, searchRequest: SearchRequest): Observable<SearchResult> {
        let key = JSON.stringify(searchRequest)
        let searchResult = this.searchWordCache.get(key)
        if (searchResult) {
            return Observable.of(searchResult)
        }

        return this.sendSearchRequest(searchRequest)
            .map(resp => this.makeSearchResult(resp))
            .map(newResult => this.mergeSearchResult(baseResult, newResult))
            .do((result: SearchResult) => this.searchWordCache.set(key, result))
    }

    makeSearchResult(response: DictSearchResponse): SearchResult {
        let result = new SearchResult()
        result.haveMore = response.haveMore

        result.baseMap = response.lemmas.reduce<LemmaOrderedMap>((map, lemma) => {
            let base = lemma.baseWord
            if (!map.lemmas[base]) {
                map.lemmas[base] = []
                map.bases.push(base)
            }
            map.lemmas[base].push(lemma)
            return map
        }, result.baseMap)

        return result
    }

    private mergeSearchResult(oldResults: SearchResult, newResult: SearchResult): SearchResult {
        oldResults.haveMore = newResult.haveMore

        newResult.baseMap.bases.forEach( base => {
            let newLemmas = newResult.baseMap.lemmas[base]
            let oldLemmas = oldResults.baseMap.lemmas[base]
            if (!oldLemmas) {
                oldResults.baseMap.lemmas[base] = newLemmas
                oldResults.bases.push(base)
            } else {
                oldResults.baseMap.lemmas[base] = oldLemmas.concat(newLemmas)
            }
        })

        return oldResults
    }


    autoCompleteSearch(term: string): Observable<WordLangPair[]> {
        let items = this.autoCompleteCache.get(term)
        if (items) {
            return Observable.of(items)
        }
        return this.http.get(`${AppConstants.apiEndPoint}/api/search/autocomplete/${term}`)
            .map(res => res.json())
            .do((result: WordLangPair[]) => this.autoCompleteCache.set(term, result))
    }

    popoverSearch(word: string, lang: string): Observable<PopoverResponse | undefined> {
        let helper = this.languageManager.getLangHelper(lang)
        let variations = helper.getWordVariations(word)

        let sr: SearchRequest = {
            word: variations.join(','),
            lang: lang,
            attr: 'k',
            chunk: -1
        }

        return this.sendSearchRequest(sr)
            .map(res => {
                if (!res || res.lemmas.length === 0) {
                    return undefined
                }
                return this.makePopoverResponse(res, lang)
            })
    }

    private makePopoverResponse(resp: DictSearchResponse, lang: string): PopoverResponse {

        let homonymMap: {[key: string]: Lemma[]} = groupBy(resp.lemmas, (lemma: Lemma) => `${lemma.baseWord}.${lemma.homonym}`)

        let homonyms = Object.keys(homonymMap).map(key => {
            let first = true
            let texts = homonymMap[key].map(lemma => {
                let text = lemma.text.trim()
                if (first) {
                    first = false
                    return text
                }
                // remove redudant keyword prefix
                let regexp = new RegExp(`\\*\\*${lemma.word}\\*\\*, *(\\d+)`)
                return text.replace(regexp, '$1')
            })
            return '<div class=\'my-homonym\'>' + texts.join(' ').replace(/;$/, '.') + '</div>'
        })

        let baseWords = uniq(resp.lemmas.map(lemmaData => lemmaData.baseWord))

        return {
            baseWords,
            resolvedWord: resp.lemmas[0].word,
            foreignLang: lang,
            text: homonyms.join('')
        }
    }

    private sendSearchRequest(sr: SearchRequest): Observable<DictSearchResponse> {
        let httpProvider: any
        let authed: string

        if (this.authService.isTokenValid()) {
            httpProvider = this.authHttp
            authed = 'authed'
        } else {
            httpProvider = this.http
            authed = 'public'
        }

        let url = `${AppConstants.apiEndPoint}/api/search/${authed}/${sr.word}/${sr.attr}/${sr.chunk}`
        if (sr.lang) {
            url += `?lang=${sr.lang}`
        }
        return httpProvider.get(url)
            .map((res: Response) => res.json())
            .catch((err: any) => {
                console.error(`server error: ${err}`)
                return Observable.throw(err)
            })
    }
}
