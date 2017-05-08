import { Component, ViewContainerRef } from '@angular/core'
import { MdIconRegistry } from '@angular/material'

import { AuthService } from './core'
import { SpeechSynthesizer } from './core'

@Component({
  selector: 'my-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef

  constructor(
    _mdIconRegistry: MdIconRegistry,
    _viewContainerRef: ViewContainerRef,
    _authService: AuthService,
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
