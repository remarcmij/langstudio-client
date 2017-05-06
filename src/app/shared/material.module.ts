import { NgModule } from '@angular/core'
import { MdSidenavModule } from '@angular/material'
import { MdToolbarModule } from '@angular/material'
import { MdButtonModule } from '@angular/material'
import { MdIconModule } from '@angular/material'
import { MdMenuModule } from '@angular/material'
import { MdListModule } from '@angular/material'

@NgModule({
  imports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdIconModule,
    MdMenuModule,
    MdListModule
  ],
  exports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdIconModule,
    MdMenuModule,
    MdListModule
  ]
})

export class MaterialModule { }
