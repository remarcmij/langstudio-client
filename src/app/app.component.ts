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
    _viewContainerRef: ViewContainerRef,
    private _mdIconRegistry: MdIconRegistry,
    private _auth: AuthService,
    private _speech: SpeechSynthesizerService
  ) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = _viewContainerRef
  }

  ngOnInit() {
    this._mdIconRegistry.registerFontClassAlias('fontawesome', 'fa')

    this._auth.captureTokenCookie()
    this._auth.getUser()
      .subscribe(null, error => console.log(error))

    if (this._speech.isSynthesisSupported) {
      console.log('speech synthesis is available')
    } else {
      console.log('speech synthesis is NOT available')
    }
  }
}
