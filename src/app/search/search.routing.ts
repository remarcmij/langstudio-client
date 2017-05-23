import { Routes, RouterModule } from '@angular/router'

import { DictionaryComponent } from './dictionary/dictionary.component'

const searchRoutes: Routes = [
  { path: 'dictionary', component: DictionaryComponent }
]

export const searchRouting = RouterModule.forChild(searchRoutes)
