import { Component, ViewContainerRef } from '@angular/core'
import { MdIconRegistry } from '@angular/material'

import { AuthenticationService } from './core'
import { SpeechSynthesizer } from './core'

@Component({
  selector: 'my-app',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef

  constructor(
    _mdIconRegistry: MdIconRegistry,
    _viewContainerRef: ViewContainerRef,
    _authService: AuthenticationService,
    _speechSynthesizer: SpeechSynthesizer
  ) {
    _mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = _viewContainerRef

    _authService.captureTokenCookie()

    if (_speechSynthesizer.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
