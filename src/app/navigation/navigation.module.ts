import { NgModule } from '@angular/core'
import { SharedModule } from '../shared/shared.module'
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component'
import { MainSidenavComponent } from './sidenav/main-sidenav.component'
import { ChildToolbarComponent } from './child-toolbar/child-toolbar.component'

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    MainToolbarComponent,
    MainSidenavComponent,
    ChildToolbarComponent
  ],
  exports: [
    MainToolbarComponent,
    ChildToolbarComponent,
    MainSidenavComponent,
  ]
})
export class NavigationModule { }
