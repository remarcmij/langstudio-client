import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { Topic } from '../../shared'
import { UtilityService } from '../../core'
import { NavigationService } from '../../core'

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
    return this.utilityService.tinyMarkdown(this.topic.subtitle)
  }

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private navigationService: NavigationService
  ) {
  }

  getImagePath(): string {
    return `/assets/product-images/${this.topic.publication}.jpg`
  }

  openPublication(): void {
    this.navigationService.clearTop('publication')
    this.router.navigate(['/library', this.topic.publication])
  }
}
