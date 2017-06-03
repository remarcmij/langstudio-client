import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { SearchComponent } from './search.component'
import { DictionaryComponent } from './dictionary/dictionary.component'
import { ParagraphsComponent } from './paragraphs/paragraphs.component'

const searchRoutes: Routes = [
  {
    path: '', component: SearchComponent, children: [
      { path: 'dict', component: DictionaryComponent },
      { path: 'para', component: ParagraphsComponent }
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(searchRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class SearchRoutingModule { }
