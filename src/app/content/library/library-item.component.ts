import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { Topic } from '../../shared'
import { NavigationService } from '../../core'
import { MarkdownService } from '../services/markdown.service'

@Component({
  selector: 'my-library-item',
  templateUrl: './library-item.component.html',
  styles: [
    `.library-item {
        cursor: pointer;
        height: 210px;
        padding: 16px;
        margin: 8px;
    }`,
    `.caption {
        margin-bottom: 0.5rem;
        line-height: 1.2;
        font-size: 0.8rem;
        color: #636c72;
    }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryItemComponent {
  @Input() topic: Topic

  get subtitle() {
    return this.markdown.tinyMarkdown(this.topic.subtitle)
  }

  constructor(
    private router: Router,
    private navigation: NavigationService,
    private markdown: MarkdownService
  ) {
  }

  getImagePath(): string {
    return `/assets/product-images/${this.topic.publication}.jpg`
  }

  openPublication() {
    this.navigation.clearTop('publication')
    this.router.navigate(['/library', this.topic.publication])
  }
}
