import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { HashTagPopoverComponent } from './hashtag-popover.component'
import { HashTagPopoverItemComponent } from './hashtag-popover-item.component'
import { HashTagCloudComponent } from './hashtag-cloud.component'
import { hashTagRouting } from './hashtag.routing'

@NgModule({
  imports: [
    SharedModule,
    hashTagRouting
  ],
  declarations: [
    HashTagPopoverComponent,
    HashTagPopoverItemComponent,
    HashTagCloudComponent
  ],
  exports: [
    HashTagPopoverComponent
  ]
})

export class HashTagModule { }
