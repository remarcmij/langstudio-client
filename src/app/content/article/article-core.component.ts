import {
    Component,
    Input,
    Output,
    AfterViewChecked,
    EventEmitter,
    ViewChild,
    ElementRef,
    ChangeDetectionStrategy
} from '@angular/core'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

import { Article, AnchorInfo } from './article.model'

@Component({
    selector: 'my-article-core',
    template: `<article #articleRef [innerHTML]="safeHtml" (click)="clicked.emit($event)"></article>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleCoreComponent implements AfterViewChecked {

    @Input() set article(article: Article) {
        this.articleElement = undefined
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(article.htmlText)
    }

    @Input() hashTag: string
    @Output() clicked = new EventEmitter<MouseEvent>()
    @Output() anchors = new EventEmitter<AnchorInfo[]>()
    @ViewChild('articleRef') articleRef: ElementRef

    safeHtml: SafeHtml
    articleElement: HTMLElement

    constructor(
        private sanitizer: DomSanitizer
    ) {
    }

    ngAfterViewChecked(): void {
        if (!this.articleElement) {
            this.articleElement = <HTMLElement>this.articleRef.nativeElement
            this.extractHeadingAnchors()
            if (this.hashTag) {
                let spans = this.extractHashTagSpans()
                spans.forEach(span => span.classList.add('my-highlight'))
                if (spans.length > 0) {
                    spans[0].setAttribute('id', 'anchor')
                }
            }
        }
    }

    private extractHeadingAnchors() {
        let anchors: AnchorInfo[] = []
        let nodeList = this.articleElement.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
        for (let i = 0; i < nodeList.length; i++) {
            let node = <HTMLElement>nodeList[i]
            anchors.push({
                tag: node.tagName,
                title: node.textContent,
                name: node.getAttribute('id')
            })
        }
        // emit anchors to parent component
        this.anchors.emit(anchors)
    }

    private extractHashTagSpans(): HTMLElement[] {
        let spans: HTMLElement[] = []
        let tagText = '#' + this.hashTag
        let nodeList = this.articleElement.querySelectorAll('span.hashtag')
        for (let i = 0; i < nodeList.length; i++) {
            let span = <HTMLElement>nodeList.item(i)
            if (span.textContent === tagText) {
                spans.push(span)
            }
        }
        return spans
    }

}
