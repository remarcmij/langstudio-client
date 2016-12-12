import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'

import { UserAdminHttpService } from './user-admin-http.service'
import { User } from '../../core'

@Component({
    selector: 'ls-user-admin',
    templateUrl: './user-admin.component.html',
    styles: []
})
export class UserAdminComponent implements OnInit, OnDestroy {

    users: User[] = []

    private subscription: Subscription

    constructor(
        private adminHttpService: UserAdminHttpService
    ) { }

    ngOnInit(): void {
        this.subscription = this.adminHttpService.getUsers()
            .subscribe(users => {
                this.users = users
            })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe()
    }
}
