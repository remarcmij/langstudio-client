import { NgModule } from '@angular/core'
import { MdAutocompleteModule } from '@angular/material'

import { SharedModule } from '../shared'
import { SearchComponent } from './search.component'
import { DictionaryComponent } from './dictionary/dictionary.component'
import { LemmaGroupComponent } from './dictionary/lemma-group/lemma-group.component'
import { DictPopoverModule } from '../content/dict-popover/dict-popover.module'
import { SearchAutocompleteComponent } from './search-autocomplete/search-autocomplete.component'
import { ParagraphsComponent } from './paragraphs/paragraphs.component'
import { SearchRoutingModule } from './search-routing.module'

@NgModule({
  imports: [
    SharedModule,
    MdAutocompleteModule,
    DictPopoverModule,
    SearchRoutingModule
  ],
  declarations: [
    SearchComponent,
    DictionaryComponent,
    LemmaGroupComponent,
    SearchAutocompleteComponent,
    ParagraphsComponent
  ]
})
export class SearchModule { }
