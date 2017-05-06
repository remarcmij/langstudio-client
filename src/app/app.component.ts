import { Component, ViewContainerRef } from '@angular/core'
import { MdIconRegistry } from '@angular/material'

import { AuthService } from './core'
import { SpeechService } from './core'

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
    speechService: SpeechService
  ) {
    mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef

    authService.captureTokenCookie()

    if (speechService.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
