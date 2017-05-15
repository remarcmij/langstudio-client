import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs/Subject'

import { AdminUserHttp } from './admin-user-http.service'
import { User } from '../../core'

@Component({
  selector: 'my-admin-user',
  templateUrl: './admin-user.component.html',
  styles: []
})
export class AdminUserComponent implements OnInit, OnDestroy {

  users: User[] = []
  private _ngUnsubscribe = new Subject<void>()

  constructor(
    private _router: Router,
    private _adminUserHttp: AdminUserHttp
  ) { }

  ngOnInit() {
    this._adminUserHttp.getUsers()
      .takeUntil(this._ngUnsubscribe)
      .subscribe(users => {
        this.users = users
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  gotoUserDetail(userId: string) {
    this._router.navigate(['/admin', 'user', userId])
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
    }
  }

}
