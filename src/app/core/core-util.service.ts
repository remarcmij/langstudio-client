import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import * as latinize from 'latinize'

const ESC_KEYCODE = 27
const foreignWordRegExp = /[-'()a-zA-Z\u00C0-\u00FF]{2,}/g

@Injectable()
export class CoreUtil {

  cleanseTerm(term: string): string {
    const match = term.match(foreignWordRegExp)
    if (match) {
      term = match[0]
    }
    term = latinize(term.trim().toLowerCase())
    return term
      .replace(/\(.*?\)/g, '')
      .replace(/[()]/g, '') || term.replace(/[()]/g, '')
  }

  cumulativeTop(element: HTMLElement) {
    let top = 0
    do {
      top += element.offsetTop || 0
      element = <HTMLElement>element.offsetParent
    } while (element)
    return top
  }

  insertMarkdownHtml(text: string): string {
    const foreignFragmentRegExp = /\*{1,2}.+?\*{1,2}/g
    let buffer = ''
    let startPos = 0
    let endPos: number
    let fragment: string
    let match = foreignFragmentRegExp.exec(text)

    while (match) {
      fragment = match[0]
      endPos = foreignFragmentRegExp.lastIndex - fragment.length
      buffer = buffer.concat(text.substring(startPos, endPos))
      startPos = foreignFragmentRegExp.lastIndex

      let startPos2 = 0
      foreignWordRegExp.lastIndex = 0
      let match2 = foreignWordRegExp.exec(fragment)
      while (match2) {
        const term = match2[0]
        const endPos2 = foreignWordRegExp.lastIndex - term.length
        buffer = buffer.concat(fragment.substring(startPos2, endPos2))
        startPos2 = foreignWordRegExp.lastIndex
        buffer = buffer.concat(`<span>${match2[0]}</span>`)
        match2 = foreignWordRegExp.exec(fragment)
      }
      buffer = buffer.concat(fragment.substring(startPos2))
      match = foreignFragmentRegExp.exec(text)
    }

    buffer = buffer.concat(text.substring(startPos))

    return this.tinyMarkdown(buffer)
  }

  tinyMarkdown(mdText: string): string {
    return mdText
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</span></strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</span></em>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  onEscKey(): Observable<KeyboardEvent> {
    return Observable.fromEvent(document.body, 'keyup')
      .filter((ev: KeyboardEvent) => ev.keyCode === ESC_KEYCODE)
      .do((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
      })
  }

  scrollDetectorFor(targetElem: Element): Observable<Event> {
    const scrollThreshold = 16
    let prevScrollTop = -1
    return Observable.fromEvent(targetElem, 'scroll')
      .filter((ev: Event) => {
        const scrollTop = (<HTMLElement>ev.target).scrollTop
        if (prevScrollTop === -1) {
          prevScrollTop = scrollTop
          return false
        }
        return Math.abs(prevScrollTop - scrollTop) >= scrollThreshold
      })
  }

}
