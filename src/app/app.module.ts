import 'hammerjs'
import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { AppComponent } from './app.component'
import { CoreModule } from './core'
import { NavigationModule } from './navigation/navigation.module'
import { ContentModule } from './content/content.module'
import { SearchModule } from './search/search.module'
import { SharedModule } from './shared'
import { AppRoutingModule } from './app-routing.module'

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NoopAnimationsModule,
    SharedModule,
    CoreModule,
    NavigationModule,
    ContentModule,
    SearchModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
