import { Component, Input, Output, EventEmitter } from '@angular/core'

import { Router } from '@angular/router'

@Component({
  selector: 'my-secondary-sidenav',
  templateUrl: './secondary-sidenav.component.html',
  styles: [
    `md-sidenav {
      width: 75%;
      max-width: 350px;
    }`
  ]
})
export class SecondarySidenavComponent {

  @Input() open = false
  @Input() title = ''
  @Output() close = new EventEmitter<void>()
  @Output() action = new EventEmitter<string>()

  constructor(
  ) {
  }

}
