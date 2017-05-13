import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { MdAutocompleteModule } from '@angular/material'

import { SharedModule } from '../shared'
import { DictionaryComponent } from './dictionary.component'
import { LemmaGroupComponent } from './lemma-group/lemma-group.component'
import { DictionaryHttp } from './dictionary-http.service'
import { DictPopoverComponent } from './dict-popover/dict-popover.component'
import { LanguageManager } from '../language/lang-helper-manager'
import { dictionaryRouting } from './dictionary.routing'
import { DictAutocompleteComponent } from './dict-autocomplete/dict-autocomplete.component'

@NgModule({
  imports: [
    HttpModule,
    SharedModule,
    MdAutocompleteModule,
    dictionaryRouting
  ],
  declarations: [
    DictionaryComponent,
    LemmaGroupComponent,
    DictPopoverComponent,
    DictAutocompleteComponent
  ],
  providers: [
    DictionaryHttp,
    LanguageManager
  ],
  exports: [
    DictPopoverComponent
  ]
})

export class DictionaryModule { }
