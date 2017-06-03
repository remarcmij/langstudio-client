import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { MdAutocompleteModule } from '@angular/material'

import { SharedModule } from '../shared'
import { SearchComponent } from './search.component'
import { DictionaryComponent } from './dictionary/dictionary.component'
import { LemmaGroupComponent } from './dictionary/lemma-group/lemma-group.component'
import { SearchApi } from './search-api.service'
import { DictPopoverComponent } from './dictionary/dict-popover/dict-popover.component'
import { LanguageService } from '../language/language.service'
import { SearchAutocompleteComponent } from './search-autocomplete/search-autocomplete.component'
import { ParagraphsComponent } from './paragraphs/paragraphs.component'
import { SearchRoutingModule } from './search-routing.module'

@NgModule({
  imports: [
    HttpModule,
    SharedModule,
    MdAutocompleteModule,
    SearchRoutingModule
  ],
  declarations: [
    SearchComponent,
    DictionaryComponent,
    LemmaGroupComponent,
    DictPopoverComponent,
    SearchAutocompleteComponent,
    ParagraphsComponent
  ],
  providers: [
    SearchApi,
    LanguageService
  ],
  exports: [
    DictPopoverComponent
  ]
})

export class SearchModule { }
