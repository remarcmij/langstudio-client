import { Injectable } from '@angular/core'
import { CanActivate, CanLoad, Route } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { AuthenticationService } from './authentication.service'

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private _authService: AuthenticationService
  ) {
  }

  canActivate(): Observable<boolean> {
    return this._authService.getUser()
      .map(user => user && user.role === 'admin')
  }

  canLoad(route: Route):  Observable<boolean> {
    return this._authService.getUser()
      .map(user => user && user.role === 'admin')
  }
}
