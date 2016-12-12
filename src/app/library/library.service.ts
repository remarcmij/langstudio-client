import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

const keyCodeEsc = 27

@Injectable()
export class LibraryService {

    handleKeyUp(cb: () => void): Subscription {
        return Observable.fromEvent(document.body, 'keyup')
            .subscribe((ev: KeyboardEvent) => {
                if (ev.keyCode === keyCodeEsc) {
                    ev.preventDefault()
                    ev.stopPropagation()
                    cb()
                }
            })
    }
}
