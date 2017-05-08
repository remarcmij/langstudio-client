import { Component, ElementRef, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Subject } from 'rxjs/Subject'
import { Response } from '@angular/http'
import { Router } from '@angular/router'

import { ContentHttp } from '../content/content-http.service'
import { HashTagItem } from '../content/article/article.model'

const scrollDistBeforeHide = 16

@Component({
  selector: 'my-hashtag-popover',
  templateUrl: './hashtag-popover.component.html',
  styles: []
})
export class HashTagPopoverComponent implements OnInit, OnDestroy {

  @Input() hashTag: string
  @Input() publication: string
  @Input() chapter: string
  @Output() shouldHide = new EventEmitter<void>()

  items: HashTagItem[] = []
  errorText: string
  scrollState: string

  private _ngUnsubscribe = new Subject<void>()
  private _prevScrollTop = -1

  constructor(
    private _elementRef: ElementRef,
    private _router: Router,
    private _contentHttp: ContentHttp
  ) {
  }

  ngOnInit() {
    this.scrollState = 'busy'

    this._contentHttp.getHashTagItems(this.hashTag)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(items => {
        items.forEach(item => {
          item.active = item.publication === this.publication && item.chapter === this.chapter
        })
        this.items = items
        this.scrollState = 'ready'
      }, (err: Response) => {
        if (err.status === 401) {
          this._router.navigate(['/signin'])
        } else {
          window.alert(`Network Error: ${err.statusText}`)
        }
      })

    Observable.fromEvent(window, 'scroll')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => {
        const scrollTop = document.body.scrollTop
        if (this._prevScrollTop === -1) {
          this._prevScrollTop = scrollTop
        } else if (Math.abs(this._prevScrollTop - scrollTop) >= scrollDistBeforeHide) {
          this.shouldHide.emit()
        }
      })

    // ignore clicks on popover body
    Observable.fromEvent(this._elementRef.nativeElement, 'click')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
      })

    // hide on clicks outside the popover
    Observable.fromEvent(window, 'click')
      .takeUntil(this._ngUnsubscribe)
      .subscribe((ev: MouseEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
        this.shouldHide.emit()
      })

    Observable.fromEvent(window, 'touchmove')
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => {
        this.shouldHide.emit()
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }
}
