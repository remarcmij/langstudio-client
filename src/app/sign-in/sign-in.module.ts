import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'

import { SharedModule } from '../shared'
import { NavigationModule } from '../navigation/navigation.module'
import { SignInComponent } from './sign-in.component'

@NgModule({
  imports: [
    HttpModule,
    SharedModule,
    NavigationModule
  ],
  declarations: [
    SignInComponent,
  ],
  providers: [
  ]
})

export class SignInModule { }
