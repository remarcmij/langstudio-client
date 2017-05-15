import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { FlexLayoutModule } from '@angular/flex-layout'

import { MaterialModule } from './material.module'
import { SimpleNavbarComponent } from './simple-navbar.component'
import { FlexContainerComponent } from './flex-container.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NoopAnimationsModule,
    FlexLayoutModule,
    MaterialModule
  ],
  declarations: [
    SimpleNavbarComponent,
    FlexContainerComponent
  ],
  providers: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    SimpleNavbarComponent,
    FlexContainerComponent
  ]
})

export class SharedModule { }
