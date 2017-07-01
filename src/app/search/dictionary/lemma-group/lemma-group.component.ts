import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'

import { Lemma } from '../../../content/lemma.model'
import { DictPopoverService } from '../../../content/dict-popover/dict-popover.service'
import { SearchApiService, DictPopoverParams } from '../../../content/services/search-api.service'
import { MarkdownService } from '../../../content/services/markdown.service'
import { LanguageService } from '../../../content/services/language.service'

@Component({
  selector: 'my-lemma-group',
  templateUrl: './lemma-group.component.html',
  styles: [
    `md-card-title {
      font-variant: small-caps;
    }`,
    `p {
      font-size: 16px;
      margin-bottom: 4px;
      line-height: 1.2;
    }`,
    `.homonym-separator {
      margin-top: 1rem;
    }`
  ]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class LemmaGroupComponent {

  @Input() word: string
  @Input() base: string
  @Input() lemmas: Lemma[]

  constructor(
    private searchApi: SearchApiService,
    private language: LanguageService,
    private popoverService: DictPopoverService,
    private markdown: MarkdownService
  ) {
  }

  onClick(ev: MouseEvent) {
    const target = <HTMLElement>ev.target
    const params = <DictPopoverParams>this.popoverService.getWordClickParams(target)
    if (params) {
      ev.preventDefault()
      ev.stopPropagation()
      params.lang = this.language.targetLang
      this.searchApi.showPopover.next(params)
    }
  }

  baseClicked(ev: MouseEvent, base: string) {
    ev.preventDefault()
    ev.stopPropagation()
    const word = base
    const lang = this.lemmas[0].baseLang
    this.searchApi.searchSubject.next({ word, lang })
  }

  convertMarkdown(text: string): string {
    return this.markdown.insertMarkdownHtml(text).replace(/<\/?p>/g, '')
  }

  isNewHomonym(idx: number): boolean {
    if (idx === 0) {
      return false
    }
    return this.lemmas[idx - 1].homonym !== this.lemmas[idx].homonym
  }

  trackByFn(index: number, lemma: Lemma): string {
    return lemma._id
  }
}
