import { Component, ViewContainerRef } from '@angular/core'
import { MdIconRegistry } from '@angular/material'

import { AuthService } from './core'
import { SpeechSynthesizerService } from './core'

@Component({
  selector: 'my-app',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  private viewContainerRef: ViewContainerRef

  constructor(
    _mdIconRegistry: MdIconRegistry,
    _viewContainerRef: ViewContainerRef,
    _auth: AuthService,
    _speech: SpeechSynthesizerService
  ) {
    _mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = _viewContainerRef

    _auth.captureTokenCookie()

    if (_speech.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
