import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'my-main-toolbar',
  templateUrl: './main-toolbar.component.html'
})
export class MainToolbarComponent {
  @Input() title: string
  @Output() action = new EventEmitter<string>()

  visitMainSite() {
    window.open('http://www.hackyourfuture.net/', '_blank').focus()
  }
}
