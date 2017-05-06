import { Component } from '@angular/core'

import { AppConstants } from '../app.constants'

@Component({
  selector: 'my-about',
  templateUrl: './about.component.html',
  styles: []
})
export class AboutComponent {

  appTitle = AppConstants.APP_TITLE

}
