import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs/Subject'

import { AdminUserApi } from './admin-user-api.service'
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
    private router: Router,
    private api: AdminUserApi
  ) {
  }

  ngOnInit() {
    this.api.getUsers()
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
    this.router.navigate(['/admin', 'user', userId])
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this.router.navigate(['/library'])
        break
    }
  }

}
