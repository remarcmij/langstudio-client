import { Component, OnDestroy } from '@angular/core'
import { NgForm } from '@angular/forms'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Router } from '@angular/router'
import { Subject } from 'rxjs/Subject'

import { AuthService } from '../core'
import { environment } from '../../environments/environment'

@Component({
  selector: 'my-sign-in',
  templateUrl: './sign-in.component.html',
  styles: []
})
export class SignInComponent implements OnDestroy {

  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _http: Http,
    private _router: Router,
    private _authService: AuthService,
  ) { }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  onSubmit(form: NgForm) {
    const body = JSON.stringify(form.value.userCredentials)

    const options = new RequestOptions({
      headers: new Headers({ 'Content-Type': 'application/json' }),
      withCredentials: true
    })

    this._http.post(`${environment.api.host}$/auth/local`, body, options)
      .takeUntil(this._ngUnsubscribe)
      .subscribe(() => {
        // let cookieHeader = response.headers.get('set-cookie')
        this._authService.captureTokenCookie()
        this._router.navigateByUrl('/')
      }, error => {
        window.alert(error.text())
        console.error(error.text())
      })
  }

  oauthSignIn(provider: string) {
    window.location.href = `${environment.api.host}$/auth/${provider}`
  }
}
