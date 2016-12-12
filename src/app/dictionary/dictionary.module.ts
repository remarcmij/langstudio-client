import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { TypeaheadModule } from 'ng2-bootstrap/ng2-bootstrap'

import { SharedModule } from '../shared'
import { DictionaryComponent } from './dictionary.component'
import { LemmaGroupComponent } from './lemma-group.component'
import { DictionaryHttpService } from './dictionary-http.service'
import { SearchBoxComponent } from './searchbox.component'
import { DictPopoverComponent } from './dict-popover.component'
import { LanguageManager } from '../language/lang-helper-manager'
import { dictionaryRouting } from './dictionary.routing'

@NgModule({
    imports: [
        TypeaheadModule,
        HttpModule,
        dictionaryRouting,
        SharedModule
    ],
    declarations: [
        DictionaryComponent,
        LemmaGroupComponent,
        SearchBoxComponent,
        DictPopoverComponent
    ],
    providers: [
        DictionaryHttpService,
        LanguageManager
    ],
    exports: [
        DictPopoverComponent
    ]
})

export class DictionaryModule { }
