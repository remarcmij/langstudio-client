import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core'

import { User } from '../../core'

@Component({
  selector: 'my-user-admin-item',
  templateUrl: './userAdminItem.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAdminItemComponent {
  @Input() user: User

  @HostBinding('class.list-group-item-danger') get adminUser() {
    return this.user.role === 'admin'
  }

}
