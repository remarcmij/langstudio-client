import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'

const ESC_KEYCODE = 27

@Injectable()
export class ContentService {

  onEscKey(): Observable<KeyboardEvent> {
    return Observable.fromEvent<KeyboardEvent>(document.body, 'keyup')
      .filter(ev => ev.keyCode === ESC_KEYCODE)
      .do(ev => {
        ev.preventDefault()
        ev.stopPropagation()
      })
  }

}
