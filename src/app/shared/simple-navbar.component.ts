import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'
import { Location } from '@angular/common'
import { Router } from '@angular/router'

export interface NavButton {
    faName: string
    command: string
}

@Component({
    selector: 'my-simple-navbar',
    templateUrl: './simple-navbar.component.html',
    styles: [
        `.btn {
            padding-left: 10px;
            padding-right: 10px;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleNavbarComponent {
    @Input() navTitle: string
    @Input() backRoute: string[]
    @Input() navButtons: NavButton[]
    @Output() handler = new EventEmitter<string>()

    constructor(
        private router: Router,
        private location: Location
    ) {
    }

    goBack(): void {
        if (this.backRoute) {
            this.router.navigate(this.backRoute)
        } else {
            this.location.back()
        }
    }

    onClick(ev: MouseEvent, command: string) {
        ev.stopPropagation()
        this.handler.emit(command)
    }
}
