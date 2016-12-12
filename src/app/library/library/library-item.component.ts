import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { Topic } from '../../shared'
import { UtilityService } from '../../core'
import { NavigationService } from '../../core'

@Component({
    selector: 'ls-library-item',
    templateUrl: 'library-item.component.html',
    styles: [
        `.publication {
            cursor: pointer;
            height: 210px;
        }`,
        `.caption {
            margin-bottom: 0.5rem;
            line-height: 1.2;
            font-size: 0.8rem;
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
