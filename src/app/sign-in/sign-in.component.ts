import { Component } from '@angular/core'
import { NgForm } from '@angular/forms'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Router } from '@angular/router'

import { AuthService } from '../core'
import { environment } from '../../environments/environment'

@Component({
  selector: 'my-sign-in',
  templateUrl: './sign-in.component.html',
  styles: []
})
export class SignInComponent {

  constructor(
    private http: Http,
    private router: Router,
    private auth: AuthService,
  ) {
  }

  onSubmit(form: NgForm) {
    const credentials = JSON.stringify(form.value.userCredentials)

    const options = new RequestOptions({
      headers: new Headers({ 'Content-Type': 'application/json' }),
      withCredentials: true
    })

    this.http.post(`${environment.api.host}/auth/local`, credentials, options)
      .subscribe(() => {
        // let cookieHeader = response.headers.get('set-cookie')
        this.auth.captureTokenCookie()
        this.router.navigateByUrl('/')
      }, error => {
        window.alert(error)
        console.error(error)
      })
  }

  oauthSignIn(provider: string) {
    window.location.href = `${environment.api.host}/auth/${provider}`
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
    }
  }

}
