import { Component } from '@angular/core'
import { Router } from '@angular/router'

import { AppConstants } from '../app.constants'

@Component({
  templateUrl: './about.component.html',
  styles: []
})
export class AboutComponent {

  appTitle = AppConstants.APP_TITLE

  constructor(
    private _router: Router,
  ) { }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
    }
  }

}
