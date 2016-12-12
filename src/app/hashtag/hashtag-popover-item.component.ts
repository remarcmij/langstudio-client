import { Component, OnInit, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { HashTagItem } from '../library/article/article.model'
import { UtilityService } from '../core'
import { NavigationService } from '../core'

@Component({
    selector: 'ls-hashtag-popover-item',
    templateUrl: 'hashtag-popover-item.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashTagPopoverItemComponent implements OnInit {
    @Input() tag: string
    @Input() item: HashTagItem
    @HostBinding('style.cursor') cursor = 'pointer'

    get subtitle() {
        return this.utilityService.tinyMarkdown(this.item.subtitle)
    }

    constructor(
        private router: Router,
        private utilityService: UtilityService,
        private navigationService: NavigationService
    ) {
    }

    ngOnInit(): void {
    }

    openArticle(): void {
        this.navigationService.clearTop('article')
        this.router.navigate(['/library', this.item.publication, this.item.chapter, { tag: this.tag }])
    }
}
