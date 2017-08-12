import { Injectable, OnInit } from '@angular/core'
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { environment } from '../../environments/environment'

// import { HttpHelper } from './http-helper.service'

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

  private _headers = new Headers()
  private _user: User | undefined

  constructor(
    private http: Http,
    private router: Router,
    // private _httpHelper: HttpHelper
  ) {
  }

  ngOnInit() {
    // this._headers.append('Content-Type', 'application/json')
    // this._http.get(`${environment.api.host}${environment.api.path}/users/me`)
  }

  getUser(): Observable<User> {
    if (this._user) {
      return Observable.of(this._user)
    }
    if (this.token) {
      const options = this._getRequestOptions()
      return this.http.get(`${environment.api.host}${environment.api.path}/users/me`, options)
        .map(response => response.json())
        .do((user: User) => this._user = user)
        // .catch(this._httpHelper.handleError)
    } else {
      return Observable.of(undefined)
    }
  }

  signOut() {
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    localStorage.removeItem(TOKEN_NAME)
    this._user = undefined
    this.router.navigate(['/'])
  }

  captureTokenCookie() {
    const token = this._getCookie('token')
    if (token) {
      localStorage.setItem(TOKEN_NAME, token.slice(1, -1))
    }
  }

  private _getCookie(name: string): string | undefined {
    const ca = document.cookie.split(';')
    const caLen = ca.length
    const cookieName = name + '='
    for (let i = 0; i < caLen; i += 1) {
      const c = ca[i].replace(/^\s+/g, '')
      if (c.indexOf(cookieName) === 0) {
        return decodeURI(c.substring(cookieName.length, c.length))
      }
    }
  }

  private _getRequestOptions(): RequestOptions {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (this.token) {
      headers.append('Authorization', 'Bearer ' + this.token)
    }
    return new RequestOptions({ headers })
  }

}
