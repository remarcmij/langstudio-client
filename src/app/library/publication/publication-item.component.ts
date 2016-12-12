import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { Topic } from '../../shared'
import { UtilityService } from '../../core'
import { NavigationService } from '../../core'

@Component({
    selector: 'ls-publication-item',
    templateUrl: 'publication-item.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicationItemComponent {
    @Input() topic: Topic
    @HostBinding('style.cursor') cursor = 'pointer'

    get subtitle() {
        return this.utilityService.tinyMarkdown(this.topic.subtitle)
    }

    constructor(
        private router: Router,
        private utilityService: UtilityService,
        private navigationService: NavigationService
    ) {
    }

    openArticle(): void {
        this.navigationService.clearTop('article')
        this.router.navigate(['/library', this.topic.publication, this.topic.chapter])
    }
}
