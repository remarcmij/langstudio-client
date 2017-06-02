import { NgModule, Optional, SkipSelf } from '@angular/core'
import { Http, RequestOptions } from '@angular/http'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/throw'
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/concat'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/first'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/mergeAll'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/toPromise'

import { SpeechSynthesizer } from './speech-synthesizer.service'
import { AuthenticationService } from './authentication.service'
import { CoreUtil } from './core-util.service'
import { HttpHelper } from './http-helper.service'
import { Navigation } from './navigation.service'
import { AuthGuard } from './auth-guard.service'
import { CanDeactivateGuard } from './can-deactivate.guard'
import { AppConstants } from '../app.constants'

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    CoreUtil,
    SpeechSynthesizer,
    AuthenticationService,
    HttpHelper,
    Navigation,
    AuthGuard,
    CanDeactivateGuard
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only')
    }
  }
}
