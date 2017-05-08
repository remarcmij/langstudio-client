import { Routes, RouterModule } from '@angular/router'

import { DictionaryComponent } from './dictionary.component'

const dictionaryRoutes: Routes = [
  { path: 'dictionary/:foreign/:base', component: DictionaryComponent }
]

export const dictionaryRouting = RouterModule.forChild(dictionaryRoutes)
