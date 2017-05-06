import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module'
import { MainToolbarComponent } from './main-toolbar/main-toolbar.component'
import { MainSidenavComponent } from './sidenav/main-sidenav.component'
import { SecondarySidenavComponent } from './sidenav/secondary-sidenav.component';
import { ChildToolbarComponent } from './child-toolbar/child-toolbar.component'

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    MainToolbarComponent,
    MainSidenavComponent,
    SecondarySidenavComponent,
    ChildToolbarComponent
  ],
  exports: [
    MainToolbarComponent,
    ChildToolbarComponent,
    MainSidenavComponent,
    SecondarySidenavComponent
  ]
})
export class NavigationModule { }
