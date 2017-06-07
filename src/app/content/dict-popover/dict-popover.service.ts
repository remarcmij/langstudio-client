import { Injectable } from '@angular/core'
import * as latinize from 'latinize'

const WORD_REGEXP = /[-'()a-zA-Z\u00C0-\u00FF]{2,}/g

@Injectable()
export class DictPopoverService {

  constructor() { }

  getWordClickParams(target: HTMLElement): {} {
    if (target.tagName !== 'SPAN') {
      return null
    }
    let word = target.innerText.trim()
    word = this._cleanseTerm(word)
    const top = this._cumulativeTop(target) - document.querySelector('#my-content').scrollTop
    const height = target.offsetHeight
    return { word, top, height }
  }

  private _cumulativeTop(element: HTMLElement) {
    let top = 0
    do {
      top += element.offsetTop || 0
      element = <HTMLElement>element.offsetParent
    } while (element)
    return top
  }

  private _cleanseTerm(term: string): string {
    const match = term.match(WORD_REGEXP)
    if (match) {
      term = match[0]
    }
    term = latinize(term.trim().toLowerCase())
    return term
      .replace(/\(.*?\)/g, '')
      .replace(/[()]/g, '') || term.replace(/[()]/g, '')
  }

}
