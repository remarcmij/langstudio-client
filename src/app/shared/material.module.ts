import { NgModule } from '@angular/core'
import { MdSidenavModule } from '@angular/material'
import { MdToolbarModule } from '@angular/material'
import { MdButtonModule } from '@angular/material'
import { MdButtonToggleModule } from '@angular/material'
import { MdIconModule } from '@angular/material'
import { MdMenuModule } from '@angular/material'
import { MdListModule } from '@angular/material'
import { MdInputModule } from '@angular/material'
import { MdCheckboxModule } from '@angular/material'
import { MdCardModule } from '@angular/material'
import { MdTooltipModule } from '@angular/material'
import { MdTabsModule } from '@angular/material'

@NgModule({
  imports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdIconModule,
    MdMenuModule,
    MdListModule,
    MdInputModule,
    MdCheckboxModule,
    MdCardModule,
    MdTooltipModule,
    MdTabsModule
  ],
  exports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdIconModule,
    MdMenuModule,
    MdListModule,
    MdInputModule,
    MdCheckboxModule,
    MdCardModule,
    MdTooltipModule,
    MdTabsModule
  ]
})

export class MaterialModule { }
