import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

const ESC_KEYCODE = 27

@Injectable()
export class ContentService {

  onEscKey(): Observable<KeyboardEvent> {
    return Observable.fromEvent(document.body, 'keyup')
      .filter((ev: KeyboardEvent) => ev.keyCode === ESC_KEYCODE)
      .do((ev: KeyboardEvent) => {
        ev.preventDefault()
        ev.stopPropagation()
      })
  }

}
