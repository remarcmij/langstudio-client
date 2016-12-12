import { Injectable, EventEmitter, NgZone } from '@angular/core'

const delay = 200 // ms

@Injectable()
export class NavigationService {

    popTopEmitter = new EventEmitter<string>()
    public topMap: { [key: string]: number } = {}

    constructor(
        private zone: NgZone
    ) {
    }

    saveTop(key: string): void {
        this.topMap[key] = document.body.scrollTop
        this.popTopEmitter.emit('busy')
    }

    restoreTop(key: string): void {
        let top = this.topMap[key] || 0
        this.zone.runOutsideAngular(() => {
            setTimeout(() => {
                this.zone.run(() => {
                    document.body.scrollTop = top
                    this.popTopEmitter.emit('ready')
                })
            }, delay)
        })
    }

    clearTop(key: string): void {
        this.topMap[key] = 0
    }

    getTop(key: string): number {
        return this.topMap[key]
    }
}
