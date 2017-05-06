import { Component, ElementRef, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
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

    private combinedSubscription = new Subscription()
    private prevScrollTop = -1

    constructor(
        private elementRef: ElementRef,
        private router: Router,
        private httpService: ContentHttp
    ) {
    }

    ngOnInit(): void {
        this.scrollState = 'busy'

        let subscription = this.httpService.getHashTagItems(this.hashTag)
            .subscribe(items => {
                items.forEach(item => {
                    item.active = item.publication === this.publication && item.chapter === this.chapter
                })
                this.items = items
                this.scrollState = 'ready'
            }, (err: Response) => {
                if (err.status === 401) {
                    this.router.navigate(['/signin'])
                } else {
                    window.alert(`Network Error: ${err.statusText}`)
                }
            })
        this.combinedSubscription.add(subscription)

        subscription = Observable.fromEvent(window, 'scroll')
            .subscribe(() => {
                let scrollTop = document.body.scrollTop
                if (this.prevScrollTop === -1) {
                    this.prevScrollTop = scrollTop
                } else if (Math.abs(this.prevScrollTop - scrollTop) >= scrollDistBeforeHide) {
                    this.shouldHide.emit()
                }
            })
        this.combinedSubscription.add(subscription)

        // ignore clicks on popover body
        subscription = Observable.fromEvent(this.elementRef.nativeElement, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
            })
        this.combinedSubscription.add(subscription)

        // hide on clicks outside the popover
        subscription = Observable.fromEvent(window, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
                this.shouldHide.emit()
            })
        this.combinedSubscription.add(subscription)

        subscription = Observable.fromEvent(window, 'touchmove')
            .subscribe(() => {
                this.shouldHide.emit()
            })
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }
}
