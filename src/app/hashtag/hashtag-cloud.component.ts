import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'

import { ContentHttp } from '../content/content-http.service'
import { Navigation } from '../core'
import { CanComponentDeactivate } from '../core'

const SELECTOR = 'my-hashtag-cloud'

export interface HashTag {
  name: string
  count: number
}

export interface HashTagGroup {
  indexChar: string
  tags: HashTag[]
}

@Component({
  selector: SELECTOR,
  templateUrl: './hashtag-cloud.component.html',
  styles: [
    `.hashtag {
      display: inline-block;
      margin: 4px;
      padding: 2px 8px;
      font-size: 14px;
      color: #C2185B;
      border: solid 1px gray;
      border-radius: 4px;
      cursor: pointer;
    }`
  ]
})
export class HashTagCloudComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  tagGroups: HashTagGroup[]
  hashTag: string
  scrollState = 'busy'

  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _contentHttp: ContentHttp,
    private _navigationService: Navigation
  ) {
  }

  ngOnInit() {
    this._navigationService.popTopEmitter
      .takeUntil(this._ngUnsubscribe)
      .subscribe((scrollState: string) => this.scrollState = scrollState)

    this._contentHttp.getAllHashTags()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(tagGroups => {
        this.tagGroups = tagGroups
        this._navigationService.restoreTop(SELECTOR)
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  canDeactivate(): boolean {
    this._navigationService.saveTop(SELECTOR)
    return true
  }

  onClick(ev: MouseEvent, hashTag: string) {
    ev.stopPropagation()
    ev.preventDefault()
    this.hashTag = hashTag
    // this.cdr.detectChanges()
  }

  hidePopover() {
    this.hashTag = undefined
  }
}
