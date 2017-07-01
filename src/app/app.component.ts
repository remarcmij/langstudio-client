import { Component, OnInit, ViewContainerRef } from '@angular/core'
import { MdIconRegistry } from '@angular/material'

import { AuthService } from './core'
import { SpeechSynthesizerService } from './core'

@Component({
  selector: 'my-app',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private viewContainerRef: ViewContainerRef

  constructor(
    viewContainerRef: ViewContainerRef,
    private mdIconRegistry: MdIconRegistry,
    private auth: AuthService,
    private speech: SpeechSynthesizerService
  ) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef
  }

  ngOnInit() {
    this.mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    this.auth.captureTokenCookie()
    this.auth.getUser()
      .subscribe(null, error => console.log(error))

    if (this.speech.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
