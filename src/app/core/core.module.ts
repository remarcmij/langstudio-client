import { NgModule, Optional, SkipSelf } from '@angular/core'
import { Http, RequestOptions } from '@angular/http'
import { AuthHttp, AuthConfig } from 'angular2-jwt'
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
import { AuthService } from './auth.service'
import { CoreUtil } from './core-util.service'
import { NavigationService } from './navigation.service'
import { AuthGuard } from './auth.guard'
import { CanDeactivateGuard } from './can-deactivate.guard'
import { AppConstants } from '../app.constants'

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenName: 'token',
    tokenGetter: (() => localStorage.getItem('token')),
    globalHeaders: [{ 'Content-Type': 'application/json' }],
  }), http, options)
}

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    CoreUtil,
    SpeechSynthesizer,
    AuthService,
    NavigationService,
    AuthGuard,
    CanDeactivateGuard,
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }
  ]
})
export class CoreModule {
  constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only')
    }
  }
}
