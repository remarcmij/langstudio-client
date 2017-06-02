import 'hammerjs'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { CoreModule } from './core'
import { NavigationModule } from './navigation/navigation.module'
import { ContentModule } from './content/content.module'
import { SearchModule } from './search/search.module'
import { AdminModule } from './admin/admin.module'
import { SignInModule } from './sign-in/sign-in.module'
import { SharedModule } from './shared'
import { AboutModule } from './about/about.module'
import { AppRoutingModule } from './app-routing.module'

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    CoreModule,
    NavigationModule,
    ContentModule,
    SearchModule,
    AdminModule,
    SignInModule,
    AboutModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
