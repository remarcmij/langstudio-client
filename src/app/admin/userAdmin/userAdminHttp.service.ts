import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'

import { environment } from '../../../environments/environment'
import { User } from '../../core'

export interface Group {
  name: string
  publications: string[]
}

@Injectable()
export class UserAdminHttpService {

  constructor(
    private authHttp: AuthHttp
  ) { }

  getUsers(): Observable<User[]> {
    const url = `${environment.api.host}${environment.api.path}/users`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  getGroups(): Observable<Group[]> {
    const url = `${environment.api.host}${environment.api.path}/topics/groups`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  getUser(id: string): Observable<User> {
    const url = `${environment.api.host}${environment.api.path}/users/${id}`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  saveGroups(id: string, groups: string[]): Observable<boolean> {
    const url = `${environment.api.host}${environment.api.path}/users/${id}/groups`
    return this.authHttp.put(url, { groups })
      .map(response => response.ok)
  }
}
