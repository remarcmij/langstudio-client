import { Injectable, EventEmitter, NgZone } from '@angular/core'
import { Observable } from 'rxjs/Observable'

const delay = 200 // ms

@Injectable()
export class NavigationService {

  popTopEmitter = new EventEmitter<string>()
  public topMap: { [key: string]: number } = {}

  constructor(
    private _zone: NgZone
  ) { }

  saveTop(key: string) {
    this.topMap[key] = document.querySelector('#my-content').scrollTop
    this.popTopEmitter.emit('busy')
  }

  restoreTop(key: string) {
    const top = this.topMap[key] || 0
    this._zone.runOutsideAngular(() => {
      setTimeout(() => {
        this._zone.run(() => {
          document.querySelector('#my-content').scrollTop = top
          this.popTopEmitter.emit('ready')
        })
      }, delay)
    })
  }

  clearTop(key: string) {
    this.topMap[key] = 0
  }

  getTop(key: string): number {
    return this.topMap[key]
  }

  scrollDetectorFor(targetElem: Element): Observable<Event> {
    const scrollThreshold = 16
    let prevScrollTop = -1
    return Observable.fromEvent(targetElem, 'scroll')
      .filter((ev: Event) => {
        const scrollTop = (<HTMLElement>ev.target).scrollTop
        if (prevScrollTop === -1) {
          prevScrollTop = scrollTop
          return false
        }
        return Math.abs(prevScrollTop - scrollTop) >= scrollThreshold
      })
  }
}
