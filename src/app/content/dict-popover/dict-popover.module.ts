import { NgModule } from '@angular/core'

import { SharedModule } from '../../shared'
import { DictPopoverComponent} from './dict-popover.component'

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    DictPopoverComponent
  ],
  exports: [
    DictPopoverComponent
  ]
})
export class DictPopoverModule { }
