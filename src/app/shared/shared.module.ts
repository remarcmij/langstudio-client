import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'

import {MaterialModule} from './material.module'
import { SimpleNavbarComponent } from './simple-navbar.component'
import { SidePanelComponent } from './sidepanel/sidepanel.component'
import { FlexContainerComponent } from './flex-container.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NoopAnimationsModule,
    FlexLayoutModule,
    MaterialModule
  ],
  declarations: [
    SimpleNavbarComponent,
    SidePanelComponent,
    FlexContainerComponent
  ],
  providers: [
  ],
  exports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    MaterialModule,
    SimpleNavbarComponent,
    SidePanelComponent,
    FlexContainerComponent
  ]
})

export class SharedModule { }
