import { Injectable } from '@angular/core'

const WORD_REGEXP = /[-'()a-zA-Z\u00C0-\u00FF]{2,}/g

@Injectable()
export class MarkdownService {

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
      WORD_REGEXP.lastIndex = 0
      let match2 = WORD_REGEXP.exec(fragment)
      while (match2) {
        const term = match2[0]
        const endPos2 = WORD_REGEXP.lastIndex - term.length
        buffer = buffer.concat(fragment.substring(startPos2, endPos2))
        startPos2 = WORD_REGEXP.lastIndex
        buffer = buffer.concat(`<span>${match2[0]}</span>`)
        match2 = WORD_REGEXP.exec(fragment)
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
}
