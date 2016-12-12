// require('!style!css!../../node_modules/font-awesome/css/font-awesome.min.css')
// require('!style!css!../assets/css/app.css')

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppComponent } from './app.component'
import { CoreModule } from './core'
import { LibraryModule } from './library/library.module'
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
        LibraryModule,
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
