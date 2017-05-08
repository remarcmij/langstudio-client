import 'hammerjs'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { CoreModule } from './core'
import { ContentModule } from './content/content.module'
import { HashTagModule } from './hashtag/hashtag.module'
import { DictionaryModule } from './dictionary/dictionary.module'
import { AdminModule } from './admin/admin.module'
import { SignInModule } from './sign-in/sign-in.module'
import { SharedModule } from './shared'
import { routing, appRoutingProviders } from './app.routing'
import { AboutComponent } from './about/about.component'

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    routing,
    ContentModule,
    HashTagModule,
    DictionaryModule,
    AdminModule,
    SignInModule,
    CoreModule
  ],
  providers: [
    appRoutingProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
