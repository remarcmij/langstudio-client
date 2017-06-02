import { NgModule } from '@angular/core'

import { SharedModule } from '../shared'
import { NavigationModule } from '../navigation/navigation.module'
import { AboutComponent } from './about.component'
import { AboutRoutingModule } from './about-routing.module'

@NgModule({
  imports: [
    SharedModule,
    NavigationModule,
    AboutRoutingModule
  ],
  declarations: [
    AboutComponent
  ]
})
export class AboutModule { }
