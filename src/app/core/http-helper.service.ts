import { Injectable } from '@angular/core'
import { Http, Response, RequestOptions, URLSearchParams, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable'

import { AuthService } from './auth.service'


@Injectable()
export class HttpHelperService {

  constructor(
    private auth: AuthService,
  ) { }

  getRequestOptions(searchParams?: URLSearchParams): RequestOptions {
    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (this.auth.token) {
      headers.append('Authorization', 'Bearer ' + this.auth.token)
    }
    const options = new RequestOptions({ headers })
    if (searchParams) {
      options.search = searchParams
    }
    return options
  }

  handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string
    if (error instanceof Response) {
      const body = error.json() || ''
      const err = body.error || JSON.stringify(body)
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`
    } else {
      errMsg = error.message ? error.message : error.toString()
    }
    console.error(errMsg)
    return Observable.throw(errMsg)
  }
}
