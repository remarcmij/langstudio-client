import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Http } from '@angular/http'

import { HttpHelperService } from '../../core/http-helper.service'
import { User } from '../../core'
import { environment } from '../../../environments/environment'

export interface Group {
  name: string
  publications: string[]
}

@Injectable()
export class AdminUserApi {

  constructor(
    private http: Http,
    private helper: HttpHelperService
  ) { }

  getUsers(): Observable<User[]> {
    const url = `${environment.api.host}${environment.api.path}/users`
    const options = this.helper.getRequestOptions()
    return this.http.get(url, options)
      .map(response => response.json())
  }

  getGroups(): Observable<Group[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/groups`
    const options = this.helper.getRequestOptions()
    return this.http.get(url, options)
      .map(response => response.json())
  }

  getUser(id: string): Observable<User> {
    const url = `${environment.api.host}${environment.api.path}/users/${id}`
    const options = this.helper.getRequestOptions()
    return this.http.get(url, options)
      .map(response => response.json())
  }

  saveGroups(id: string, groups: string[]): Observable<boolean> {
    const url = `${environment.api.host}${environment.api.path}/users/${id}/groups`
    const options = this.helper.getRequestOptions()
    return this.http.put(url, { groups }, options)
      .map(response => response.ok)
  }
}
