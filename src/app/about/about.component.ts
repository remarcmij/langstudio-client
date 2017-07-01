import { Component } from '@angular/core'
import { Router } from '@angular/router'

import { config } from '../app.config'

@Component({
  templateUrl: './about.component.html',
  styles: []
})
export class AboutComponent {

  appTitle = config.appTitle

  constructor(
    private router: Router,
  ) {
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
    }
  }

}
