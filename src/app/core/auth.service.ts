import { Injectable, OnInit } from '@angular/core'
import { Http, Headers } from '@angular/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'
import { AuthHttp, JwtHelper } from 'angular2-jwt'

import { environment } from '../../environments/environment'

const TOKEN_NAME = 'token'

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
  get token() { return localStorage.getItem(TOKEN_NAME) }

  private _jwtHelper = new JwtHelper()
  private _headers = new Headers()
  private _user: User | undefined

  constructor(
    private _http: Http,
    private _authHttp: AuthHttp,
    private _router: Router
  ) {
  }

  ngOnInit() {
    this._headers.append('Content-Type', 'application/json')
    this._http.get(`${environment.api.host}${environment.api.path}/users/me`)
  }

  isTokenValid(): boolean {
    const token = this.token
    if (!token || this._jwtHelper.isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_NAME)
      return false
    }
    return true
  }

  getUser(): Observable<User> {
    if (this._user) {
      return Observable.of(this._user)
    }
    if (this.isTokenValid()) {
      return this._authHttp.get(`${environment.api.host}${environment.api.path}/users/me`, {
        headers: this._headers
      }).map(response => response.json())
        .do((user: User) => this._user = user)
    } else {
      return Observable.of(undefined)
    }
  }

  signOut() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.removeItem(TOKEN_NAME)
    this._user = undefined
    this._router.navigate(['/'])
  }

  captureTokenCookie() {
    const token = this.getCookie('token')
    if (token) {
      localStorage.setItem(TOKEN_NAME, token.slice(1, -1))
    }
  }

  private getCookie(name: string): string | undefined {
    const ca = document.cookie.split(';')
    const caLen = ca.length
    const cookieName = name + '='

    for (let i = 0; i < caLen; i += 1) {
      const c = ca[i].replace(/^\s\+/g, '')
      if (c.indexOf(cookieName) === 0) {
        return decodeURI(c.substring(cookieName.length, c.length))
      }
    }

    return
  }
}
