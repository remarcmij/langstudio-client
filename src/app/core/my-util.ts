import * as latinize from 'latinize'

const FOREIGN_WORD_REGEXP = /[-'()a-zA-Z\u00C0-\u00FF]{2,}/g
const FOREIGN_FRAGMENT_REGEXP = /\*{1,2}.+?\*{1,2}/g

export function cleanseTerm(term: string): string {
  const match = term.match(FOREIGN_WORD_REGEXP)
  if (match) {
    term = match[0]
  }
  term = latinize(term.trim().toLowerCase())
  return term
    .replace(/\(.*?\)/g, '')
    .replace(/[()]/g, '') || term.replace(/[()]/g, '')
}

export function cumulativeTop(element: HTMLElement) {
  let top = 0
  do {
    top += element.offsetTop || 0
    element = <HTMLElement>element.offsetParent;
  } while (element)
  return top
}

export function insertMarkdownHtml(text: string): string {
  let buffer = ''
  let startPos = 0
  let endPos: number
  FOREIGN_FRAGMENT_REGEXP.lastIndex = 0
  let match = FOREIGN_FRAGMENT_REGEXP.exec(text)
  let fragment: string

  while (match) {
    fragment = match[0]

    endPos = FOREIGN_FRAGMENT_REGEXP.lastIndex - fragment.length
    buffer = buffer.concat(text.substring(startPos, endPos))
    startPos = FOREIGN_FRAGMENT_REGEXP.lastIndex

    let startPos2 = 0
    FOREIGN_WORD_REGEXP.lastIndex = 0
    let match2 = FOREIGN_WORD_REGEXP.exec(fragment)
    while (match2) {
      const term = match2[0]
      const endPos2 = FOREIGN_WORD_REGEXP.lastIndex - term.length
      buffer = buffer.concat(fragment.substring(startPos2, endPos2))
      startPos2 = FOREIGN_WORD_REGEXP.lastIndex
      buffer = buffer.concat(`<span>${match2[0]}</span>`)
      match2 = FOREIGN_WORD_REGEXP.exec(fragment)
    }
    buffer = buffer.concat(fragment.substring(startPos2))

    match = FOREIGN_FRAGMENT_REGEXP.exec(text)
  }

  buffer = buffer.concat(text.substring(startPos))

  return tinyMarkdown(buffer)
}

export function tinyMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</span></strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</span></em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
