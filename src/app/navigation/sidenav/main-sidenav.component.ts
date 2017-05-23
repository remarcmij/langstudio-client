import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'

import { User } from '../../core'

@Component({
  selector: 'my-main-sidenav',
  templateUrl: './main-sidenav.component.html',
  styles: [
    `md-sidenav {
      width: 75%;
      max-width: 350px;
    }`
  ]
})
export class MainSidenavComponent {
  @Input() open = false
  @Input() title = ''
  @Input() user: User
  @Output() action = new EventEmitter<string>()
}
