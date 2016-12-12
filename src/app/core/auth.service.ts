import { Injectable, OnInit } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { AuthHttp, JwtHelper } from 'angular2-jwt'

import { AppConstants } from '../app.constants'

export class User {
    _id: string
    email: string
    groups: string[]
    name: string
    provider: 'local' | 'google'
    role: 'user' | 'admin'
}

@Injectable()
export class AuthService implements OnInit {

    get user() { return this._user }
    get token() { return localStorage.getItem(AppConstants.tokenName) }

    private jwtHelper = new JwtHelper()
    private headers = new Headers()
    private _user: User | undefined

    constructor(
        private http: Http,
        private authHttp: AuthHttp,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.headers.append('Content-Type', 'application/json')
        this.http.get(`${AppConstants.apiEndPoint}/api/users/me`)
    }

    isTokenValid(): boolean {
        let token = this.token
        if (!token) {
            return false
        }
        if (this.jwtHelper.isTokenExpired(token)) {
            localStorage.removeItem(AppConstants.tokenName)
            return false
        }
        return true
    }

    getUser(): Observable<User> {
        if (this._user) {
            return Observable.of(this._user)
        }
        if (this.isTokenValid()) {
            return this.authHttp.get(`${AppConstants.apiEndPoint}/api/users/me`, {
                headers: this.headers
            }).map(response => response.json())
                .do((user: User) => this._user = user)
        } else {
            return Observable.of(undefined)
        }
    }

    signOut(): void {
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        localStorage.removeItem(AppConstants.tokenName)
        this._user = undefined
        this.router.navigate(['/'])
    }

    captureTokenCookie(): void {
        let token = this.getCookie('token')
        if (token) {
            localStorage.setItem(AppConstants.tokenName, token.slice(1, -1))
        }
    }

    private getCookie(name: string): string | undefined {
        let ca = document.cookie.split(';')
        let caLen = ca.length
        let cookieName = name + '='
        let c: string

        for (let i = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s\+/g, '')
            if (c.indexOf(cookieName) === 0) {
                return decodeURI(c.substring(cookieName.length, c.length))
            }
        }

        return undefined
    }
}
