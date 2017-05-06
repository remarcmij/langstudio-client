import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Location } from '@angular/common'
import { Router, ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs/Subscription'

import { DictionaryHttpService, WordLangPair, SearchRequest, SearchResult } from './dictionary-http.service'
import { SpeechService } from '../core'
import { NavigationService } from '../core'
import { DictPopoverInput } from '../dictionary/dict-popover.component'

@Component({
    selector: 'my-dictionary',
    templateUrl: './dictionary.component.html',
    styles: [
        `.btn {
            padding-left: 10px;
            padding-right: 10px;
        }`
    ]
})
export class DictionaryComponent implements OnInit, OnDestroy {

    req: SearchRequest = {
        word: '',
        lang: '',
        attr: 'r',
        chunk: 0
    }

    result = new SearchResult()

    searchTerm: string
    disabled: boolean = false;
    status: { isopen: boolean } = { isopen: false }
    popoverInput: DictPopoverInput

    private foreignLang: string
    private baseLang: string
    private combinedSubscription = new Subscription()

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private location: Location,
        private httpService: DictionaryHttpService,
        private speechService: SpeechService,
        private navigationService: NavigationService
    ) {
    }

    ngOnInit(): void {
        let subscription = this.activatedRoute.params.subscribe((params: any) => {
            this.foreignLang = params['foreign']
            this.baseLang = params['base']
            this.req.word = params['word'] || this.req.word
            this.req.lang = this.foreignLang
            if (this.req.word) {
                this.wordLangSearch({ word: this.req.word, lang: this.req.lang })
            }
        })
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }

    popoverSearch(event: any) {
        this.hidePopover()
        this.popoverInput = {
            word: event.word,
            lang: this.foreignLang,
            top: event.top,
            height: event.height
        }
        this.cdr.detectChanges()
    }

    hidePopover(): void {
        this.popoverInput = undefined
        this.cdr.detectChanges()
    }

    goBack(): void {
        this.location.back()
        // this.router.navigate(this.backRoute)
    }

    executeSearch(word: string, event: MouseEvent) {
        if (event.shiftKey) {
            this.searchTerm = ''
        } else {
            this.wordLangSearch({ word, lang: this.foreignLang })
        }
    }

    searchTermChanged(): void {

    }

    foreignWordSearch(word: string): void {
        this.wordLangSearch({ word, lang: this.foreignLang })
        // this.router.navigate(['/dictionary', this.foreignLang, this.baseLang, { word }])
    }

    wordLangSearch(item: WordLangPair): void {
        this.hidePopover()

        this.req.word = item.word
        this.req.lang = item.lang
        this.req.chunk = 0

        this.result = new SearchResult()

        window.scrollTo(0, 0)

        this.searchMore()
    }

    speakWord(word: string): void {
        let subscription = this.speechService.speakSingle(word, this.foreignLang)
            .subscribe()
        this.combinedSubscription.add(subscription)
    }

    private searchMore(): void {

        this.httpService
            .searchWord(this.result, this.req)
            .subscribe(result => {
                this.result = result
                if (result.haveMore) {
                    this.req.chunk += 1
                    this.searchMore()
                }
            })
    }
}
