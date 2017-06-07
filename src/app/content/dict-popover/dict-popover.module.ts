import { NgModule } from '@angular/core'

import { SharedModule } from '../../shared'
import { DictPopoverComponent } from './dict-popover.component'
import { DictPopoverService } from './dict-popover.service'

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    DictPopoverComponent
  ],
  providers: [
    DictPopoverService
  ],
  exports: [
    DictPopoverComponent
  ]
})
export class DictPopoverModule { }
