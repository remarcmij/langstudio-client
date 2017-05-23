import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { MdAutocompleteModule } from '@angular/material'

import { SharedModule } from '../shared'
import { DictionaryComponent } from './dictionary/dictionary.component'
import { LemmaGroupComponent } from './dictionary/lemma-group/lemma-group.component'
import { SearchHttp } from './search-http.service'
import { DictPopoverComponent } from './dictionary/dict-popover/dict-popover.component'
import { LanguageManager } from '../language/lang-helper-manager'
import { searchRouting } from './search.routing'
import { DictAutocompleteComponent } from './dictionary/dict-autocomplete/dict-autocomplete.component';
import { ParagraphsComponent } from './paragraphs/paragraphs.component';
import { ParagraphComponent } from './paragraphs/paragraph.component'

@NgModule({
  imports: [
    HttpModule,
    SharedModule,
    MdAutocompleteModule,
    searchRouting
  ],
  declarations: [
    DictionaryComponent,
    LemmaGroupComponent,
    DictPopoverComponent,
    DictAutocompleteComponent,
    ParagraphsComponent,
    ParagraphComponent
  ],
  providers: [
    SearchHttp,
    LanguageManager
  ],
  exports: [
    DictPopoverComponent
  ]
})

export class SearchModule { }
