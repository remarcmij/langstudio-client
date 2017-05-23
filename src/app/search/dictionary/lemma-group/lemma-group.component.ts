import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'

import { Lemma } from './lemma.model'
import { CoreUtil } from '../../../core'

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

  @Output() wordSearch = new EventEmitter<string>()
  @Output() popoverSearch = new EventEmitter<{}>()

  constructor(
    private _coreUtil: CoreUtil
  ) { }

  onClick(ev: MouseEvent) {
    const target = <HTMLElement>ev.target
    if (target.tagName === 'SPAN') {
      ev.preventDefault()
      ev.stopPropagation()
      let word = target.innerText.trim()
      if (target.classList.contains('hashtag')) {
        console.log(`hashtag clicked: ${word}`)
      } else {
        word = this._coreUtil.cleanseTerm(word)
        const top = this._coreUtil.cumulativeTop(target) - document.querySelector('#my-content').scrollTop
        const style = window.getComputedStyle(target)
        const height = parseInt(style.getPropertyValue('line-height'), 10)
        this.popoverSearch.emit({ word, top, height })
      }
    }
  }

  baseClicked(ev: MouseEvent, base: string) {
    ev.preventDefault()
    ev.stopPropagation()
    this.wordSearch.emit(base)
  }

  convertMarkdown(text: string): string {
    return this._coreUtil.insertMarkdownHtml(text).replace(/<\/?p>/g, '')
  }

  isNewHomonym(idx: number): boolean {
    if (idx === 0) {
      return false
    }
    return this.lemmas[idx - 1].homonym !== this.lemmas[idx].homonym
  }

  trackByFn(index: number, lemma: Lemma): string {
    return lemma._id;
  }
}
