import { NgModule } from '@angular/core'
import { MdSidenavModule } from '@angular/material'
import { MdToolbarModule } from '@angular/material'
import { MdButtonModule } from '@angular/material'
import { MdIconModule } from '@angular/material'
import { MdMenuModule } from '@angular/material'
import { MdListModule } from '@angular/material'
import { MdAutocompleteModule } from '@angular/material'
import { MdInputModule } from '@angular/material'
import {MdCardModule} from '@angular/material'

@NgModule({
  imports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdIconModule,
    MdMenuModule,
    MdListModule,
    MdAutocompleteModule,
    MdInputModule,
    MdCardModule
  ],
  exports: [
    MdSidenavModule,
    MdToolbarModule,
    MdButtonModule,
    MdIconModule,
    MdMenuModule,
    MdListModule,
    MdAutocompleteModule,
    MdInputModule,
    MdCardModule
  ]
})

export class MaterialModule { }
