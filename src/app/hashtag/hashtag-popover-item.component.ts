import { Component, OnInit, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'

import { HashTagItem } from '../content/article/article.model'
import {CoreUtil} from '../core'
import { NavigationService } from '../core'

@Component({
  selector: 'my-hashtag-popover-item',
  templateUrl: './hashtag-popover-item.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HashTagPopoverItemComponent implements OnInit {
  @Input() tag: string
  @Input() item: HashTagItem
  @HostBinding('style.cursor') cursor = 'pointer'

  get subtitle() {
    return this._coreUtil.tinyMarkdown(this.item.subtitle)
  }

  constructor(
    private _router: Router,
    private _coreUtil: CoreUtil,
    private _navigationService: NavigationService
  ) {
  }

  ngOnInit() {
  }

  openArticle() {
    this._navigationService.clearTop('article')
    this._router.navigate(['/library', this.item.publication, this.item.chapter, { tag: this.tag }])
  }
}
