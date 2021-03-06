import { Component, OnInit, OnDestroy } from '@angular/core'
import { Subject } from 'rxjs/Subject'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

import { SearchApiService, SearchRequest, LemmaSearchResult, WordLang, Paragraph } from '../../content/services/search-api.service'
import { MarkdownService } from '../../content/services/markdown.service'

@Component({
  selector: 'my-paragraphs',
  templateUrl: './paragraphs.component.html',
  styles: []
})
export class ParagraphsComponent implements OnInit, OnDestroy {

  paras: Paragraph[] = []

  searchRequest: SearchRequest = {
    word: '',
    lang: '',
    chunk: 0
  }
  private _ngUnsubscribe = new Subject<void>()


  constructor(
    private sanitizer: DomSanitizer,
    private searchApi: SearchApiService,
    private markdown: MarkdownService
  ) {
  }

  ngOnInit() {
    this.searchApi.searchSubject
      .takeUntil(this._ngUnsubscribe)
      .subscribe(target => {
        if (target) {
          this.wordLangSearch(target)
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  safeHtml(rawBody: string): SafeHtml {
    const html = this.markdown.insertMarkdownHtml(rawBody)
    return this.sanitizer.bypassSecurityTrustHtml(html)
  }

  trackByFn(index: number, para: Paragraph): string {
    return para._id
  }

  wordLangSearch(searchTarget: WordLang) {
    this.searchRequest.word = searchTarget.word
    this.searchRequest.lang = searchTarget.lang
    this.searchRequest.chunk = 0
    this.paras = []
    window.scrollTo(0, 0)
    this._searchMore()
  }

  private _searchMore() {
    this.searchApi.searchParagraphs(this.searchRequest)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(result => {
        this.paras = this.paras.concat(result.paragraphs)
        if (result.haveMore) {
          this.searchRequest.chunk += 1
          this._searchMore()
        }
      })
  }

}
