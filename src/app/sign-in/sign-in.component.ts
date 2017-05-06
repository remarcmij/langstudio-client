import { Component, OnInit } from '@angular/core'
import { NgForm } from '@angular/forms'
import { Http, Headers, RequestOptions } from '@angular/http'
import { Router } from '@angular/router'

import { AuthService } from '../core'
import { AppConstants } from '../app.constants'

@Component({
    selector: 'my-sign-in',
    templateUrl: './sign-in.component.html',
    styles: []
})
export class SignInComponent implements OnInit {

    constructor(
        private http: Http,
        private router: Router,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
    }

    onSubmit(form: NgForm): void {
        let body = JSON.stringify(form.value.userCredentials)

        let headers = new Headers({
            'Content-Type': 'application/json'
        })

        let options = new RequestOptions({
            headers,
            withCredentials: true
        })

        this.http.post(`${AppConstants.API_END_POINT}/auth/local`, body, options)
            .subscribe(() => {
                // let cookieHeader = response.headers.get('set-cookie')
                this.authService.captureTokenCookie()
                this.router.navigateByUrl('/')
            }, error => {
                window.alert(error.text())
                console.error(error.text())
            })
    }

    oauthSignIn(provider: string): void {
        window.location.href = `${AppConstants.API_END_POINT}/auth/${provider}`
    }
}
