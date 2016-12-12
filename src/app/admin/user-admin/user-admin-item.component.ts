import { Component, OnInit, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core'

import { User } from '../../core'

@Component({
    selector: 'ls-user-admin-item',
    templateUrl: 'user-admin-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAdminItemComponent implements OnInit {
    @Input() user: User

    @HostBinding('class.list-group-item-danger') get adminUser() {
        return this.user.role === 'admin'
    }

    constructor() { }

    ngOnInit(): void { }
}
