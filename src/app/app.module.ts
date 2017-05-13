import 'hammerjs'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { CoreModule } from './core'
import { NavigationModule}  from './navigation/navigation.module'
import { ContentModule } from './content/content.module'
import { HashTagModule } from './hashtag/hashtag.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { AdminModule } from './admin/admin.module'
import { SignInModule } from './sign-in/sign-in.module'
import { SharedModule } from './shared'
import { AboutComponent } from './about/about.component'
import { routing, appRoutingProviders } from './app.routing'

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    routing,
    CoreModule,
    NavigationModule,
    ContentModule,
    HashTagModule,
    DictionaryModule,
    AdminModule,
    SignInModule
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
