import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'

import { SharedModule } from '../shared'
import { NavigationModule } from '../navigation/navigation.module'
import { SignInComponent } from './sign-in.component'
import { SignInRoutingModule } from './sign-in-routing.module'

@NgModule({
  imports: [
    HttpModule,
    SharedModule,
    NavigationModule,
    SignInRoutingModule
  ],
  declarations: [
    SignInComponent,
  ],
  providers: [
  ]
})

export class SignInModule { }
