import { Injectable } from '@angular/core'
import { CanActivate } from '@angular/router'
import { Observable } from 'rxjs/Observable'

import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private _authService: AuthService
  ) {
  }

  canActivate(): Observable<boolean> {
    return this._authService.getUser()
      .map(user => user && user.role === 'admin')
  }
}
