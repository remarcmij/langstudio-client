import {
    Component, OnInit, OnDestroy, Input, Output, EventEmitter,
    ViewChild, ElementRef, Renderer, NgZone, ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

const leftMargin = 56;

@Component({
    selector: 'ls-sidepanel',
    templateUrl: 'sidepanel.component.html',
    styles: [
        `:host {
            position: fixed;
            top: 0;
            bottom: 0;
            z-index: 2000;
            background-color: #fff;
            opacity: 1;
            max-width: 400px;
            transition-duration: 250ms;
        }`,
        `.btn {
            margin-top: 9px;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidePanelComponent implements OnInit, OnDestroy {

    @Input() title: string;
    @Input() location = 'left'
    @Output() shouldHide = new EventEmitter<void>()
    @ViewChild('container') containerRef: ElementRef

    private subscriptions: Subscription[] = []

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer,
        private zone: NgZone,
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        if (this.location !== 'left' && this.location !== 'right') {
            throw new Error(`location attribute value must be 'left' or 'right'`)
        }

        let width = window.innerWidth - leftMargin
        let element: HTMLElement = this.elementRef.nativeElement
        this.renderer.setElementStyle(element, 'transitionProperty', this.location)
        this.renderer.setElementStyle(element, 'width', `${width}px`)
        this.renderer.setElementStyle(element, this.location, `${-width}px`)

        this.renderer.setElementClass(document.body, 'ls-modal-open', true)

        let subscription: Subscription

        subscription = Observable.fromEvent(this.containerRef.nativeElement, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
            })
        this.subscriptions.push(subscription)

        subscription = Observable.fromEvent(document.body, 'click')
            .subscribe((ev: MouseEvent) => {
                ev.preventDefault()
                ev.stopPropagation()
                this.shouldHide.emit()
            })
        this.subscriptions.push(subscription)

        this.zone.runOutsideAngular(() => {
            setTimeout(() => {
                this.zone.run(() => {
                    this.renderer.setElementStyle(element, this.location, '0')
                })
            })
        })
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe())
        this.renderer.setElementClass(document.body, 'ls-modal-open', false)
    }
}
