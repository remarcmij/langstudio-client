import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpModule } from '@angular/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'

import { MaterialModule } from './material.module'
import { FlexContainerComponent } from './flex-container.component'

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FlexLayoutModule
  ],
  declarations: [
    FlexContainerComponent
  ],
  providers: [],
  exports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    FlexContainerComponent
  ]
})

export class SharedModule { }
