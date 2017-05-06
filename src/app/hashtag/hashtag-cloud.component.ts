import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { Response } from '@angular/http'
import { Subscription } from 'rxjs/Subscription'

import { ContentHttpService } from '../content/contentHttp.service'
import { NavigationService } from '../core'
import { CanComponentDeactivate } from '../core'

const scrollTopName = 'hashTagCloud'

export interface HashTag {
    name: string
    count: number
}

export interface HashTagGroup {
    indexChar: string
    tags: HashTag[]
}

@Component({
    selector: 'my-hashtag-cloud',
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

    private combinedSubscription = new Subscription()

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private httpService: ContentHttpService,
        private navigationService: NavigationService
    ) {
    }

    ngOnInit(): void {
        let subscription = this.navigationService.popTopEmitter
            .subscribe((scrollState: string) => this.scrollState = scrollState)
        this.combinedSubscription.add(subscription)

        this.httpService.getAllHashTags()
            .subscribe(tagGroups => {
                this.tagGroups = tagGroups
                this.navigationService.restoreTop(scrollTopName)
            }, (err: Response) => {
                if (err.status === 401) {
                    this.router.navigate(['/signin'])
                } else {
                    window.alert(`Network Error: ${err.statusText}`)
                }
            })
        this.combinedSubscription.add(subscription)
    }

    ngOnDestroy(): void {
        this.combinedSubscription.unsubscribe()
    }


    canDeactivate(): boolean {
        this.navigationService.saveTop(scrollTopName)
        return true
    }

    onClick(ev: MouseEvent, hashTag: string): void {
        ev.stopPropagation()
        ev.preventDefault()
        this.hashTag = hashTag
        // this.cdr.detectChanges()
    }

    hidePopover(): void {
        this.hashTag = undefined
    }
}
