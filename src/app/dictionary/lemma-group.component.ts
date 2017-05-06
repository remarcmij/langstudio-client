import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'

import { UtilityService } from '../core'
import { Lemma } from './lemma.model'

@Component({
    selector: 'my-lemma-group',
    templateUrl: './lemma-group.component.html',
    styles: [
        `p {
            margin-bottom: 4px;
            line-height: 1.2;
        }`,
        `.homonym-separator {
            margin-top: 1rem;
        }`,
        `.lemma-base {
            text-decoration: none;
            font-variant: small-caps;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LemmaGroupComponent {

    @Input() word: string
    @Input() base: string
    @Input() lemmas: Lemma[]

    @Output() wordSearch = new EventEmitter<string>()
    @Output() popoverSearch = new EventEmitter<{}>()

    constructor(
        private utilityService: UtilityService
    ) {
    }

    onClick(ev: MouseEvent): void {
        this.utilityService.handleSpanClick(ev, (word, top, height) => {
            this.popoverSearch.emit({ word, top, height })
        })
    }

    baseClicked(ev: MouseEvent, base: string) {
        ev.preventDefault()
        ev.stopPropagation()
        this.wordSearch.emit(base)
    }

    convertMarkdown(text: string): string {
        return this.utilityService.insertMarkdownHtml(text).replace(/<\/?p>/g, '')
    }

    isNewHomonym(idx: number): boolean {
        if (idx === 0) {
            return false
        }
        return this.lemmas[idx - 1].homonym !== this.lemmas[idx].homonym
    }
}
