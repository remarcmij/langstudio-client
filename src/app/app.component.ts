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
    mdIconRegistry: MdIconRegistry,
    viewContainerRef: ViewContainerRef,
    authService: AuthService,
    speechSynthesizer: SpeechSynthesizer
  ) {
    mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef

    authService.captureTokenCookie()

    if (speechSynthesizer.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
