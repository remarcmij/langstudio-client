import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { AuthHttp } from 'angular2-jwt'

import { AppConstants } from '../../app.constants'
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
    let url = `${AppConstants.apiEndPoint}/api/users`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  getGroups(): Observable<Group[]> {
    let url = `${AppConstants.apiEndPoint}/api/topics/groups`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  getUser(id: string): Observable<User> {
    let url = `${AppConstants.apiEndPoint}/api/users/${id}`
    return this.authHttp.get(url)
      .map(response => response.json())
  }

  saveGroups(id: string, groups: string[]): Observable<boolean> {
    let url = `${AppConstants.apiEndPoint}/api/users/${id}/groups`
    return this.authHttp.put(url, { groups })
      .map(response => response.ok)
  }
}
