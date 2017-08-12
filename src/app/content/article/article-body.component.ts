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
  selector: 'my-article-body',
  template: `<article #articleRef class="text-content markdown-body" [innerHTML]="safeHtml" (click)="clicked.emit($event)"></article>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleBodyComponent implements AfterViewChecked {

  @Input() set article(article: Article) {
    this._articleElement = undefined
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(article.body)
  }

  @Input() hashTag: string
  @Output() clicked = new EventEmitter<MouseEvent>()
  @Output() anchors = new EventEmitter<AnchorInfo[]>()
  @ViewChild('articleRef') _articleRef: ElementRef

  safeHtml: SafeHtml
  private _articleElement: HTMLElement

  constructor(
    private sanitizer: DomSanitizer
  ) {
  }

  ngAfterViewChecked() {
    if (!this._articleElement) {
      this._articleElement = <HTMLElement>this._articleRef.nativeElement
      this._extractHeadingAnchors()
      if (this.hashTag) {
        const spans = this._extractHashTagSpans()
        spans.forEach(span => span.classList.add('my-highlight'))
        if (spans.length > 0) {
          spans[0].setAttribute('id', 'anchor')
        }
      }
    }
  }

  private _extractHeadingAnchors() {
    const anchors: AnchorInfo[] = []
    const nodeList = this._articleElement.querySelectorAll('h1[id], h2[id], h3[id], h4[id]')
    for (let i = 0; i < nodeList.length; i++) {
      const node = <HTMLElement>nodeList[i]
      anchors.push({
        tag: node.tagName,
        title: node.textContent,
        name: node.getAttribute('id')
      })
    }
    // emit anchors to parent component
    this.anchors.emit(anchors)
  }

  private _extractHashTagSpans(): HTMLElement[] {
    const spans: HTMLElement[] = []
    const tagText = '#' + this.hashTag
    const nodeList = this._articleElement.querySelectorAll('span.hashtag')
    for (let i = 0; i < nodeList.length; i++) {
      const span = <HTMLElement>nodeList.item(i)
      if (span.textContent === tagText) {
        spans.push(span)
      }
    }
    return spans
  }

}
