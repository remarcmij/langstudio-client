import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'

import { SharedModule } from '../shared'
import { SignInComponent } from './sign-in.component'

@NgModule({
  imports: [
    HttpModule,
    SharedModule
  ],
  declarations: [
    SignInComponent,
  ],
  providers: [
  ]
})

export class SignInModule { }
