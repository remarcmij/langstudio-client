import { Injectable } from '@angular/core'
// import * as XRegExp from 'xregexp'
import * as latinize from 'latinize'

const foreignWordRegExp = /[-'()a-zA-Z\u00C0-\u00FF]{2,}/g
const foreignFragmentRegExp = /\*{1,2}.+?\*{1,2}/g

@Injectable()
export class UtilityService {

    constructor() { }

    handleSpanClick(ev: MouseEvent, cb: (w: string, t: number, h: number) => void) {
        let target = <HTMLElement>ev.target
        if (target.tagName === 'SPAN') {
            ev.preventDefault()
            ev.stopPropagation()
            let text = target.innerText.trim()
            if (target.classList.contains('hashtag')) {
                console.log(`hashtag clicked: ${text}`)
            } else {
                text = this.cleanseTerm(text)
                let top = this.cumulativeTop(target) - document.body.scrollTop
                let style = window.getComputedStyle(target)
                let height = parseInt(style.getPropertyValue('line-height'), 10)
                cb(text, top, height)
            }
        }
    }

    cleanseTerm(term: string): string {
        let match = term.match(foreignWordRegExp)
        if (match) {
            term = match[0]
        }
        term = latinize(term.trim().toLowerCase())
        return term
            .replace(/\(.*?\)/g, '')
            .replace(/[()]/g, '') || term.replace(/[()]/g, '')
    }

    insertMarkdownHtml(text: string): string {
        let buffer = ''
        let startPos = 0
        let endPos: number
        foreignFragmentRegExp.lastIndex = 0
        let match = foreignFragmentRegExp.exec(text)
        let fragment: string

        while (match) {
            fragment = match[0]

            endPos = foreignFragmentRegExp.lastIndex - fragment.length
            buffer = buffer.concat(text.substring(startPos, endPos))
            startPos = foreignFragmentRegExp.lastIndex

            let startPos2 = 0
            foreignWordRegExp.lastIndex = 0
            let match2 = foreignWordRegExp.exec(fragment)
            while (match2) {
                let term = match2[0]
                let endPos2 = foreignWordRegExp.lastIndex - term.length
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

    tinyMarkdown(text: string): string {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</span></strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</span></em>')
            .replace(/__(.+?)__/g, '<strong>$1</strong>')
            .replace(/_(.+?)_/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
    }

    guid(): string {
        function _p8(s?: boolean): string {
            let p = (Math.random().toString(16) + '000000000').substr(2, 8)
            return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p
        }
        return _p8() + _p8(true) + _p8(true) + _p8()
    }

    isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    }

    isiPhone(): boolean {
        return /iPhone/i.test(navigator.userAgent)
    }

    isiPad(): boolean {
        return /iPad/i.test(navigator.userAgent)
    }

    isAndroid(): boolean {
        return /Android/i.test(navigator.userAgent)
    }

    isSmallWidth(): boolean {
        return window.outerWidth < 544;
    }

    cumulativeTop(element: HTMLElement) {
        let top = 0
        do {
            top += element.offsetTop || 0
            element = <HTMLElement>element.offsetParent;
        } while (element)
        return top
    }

}
