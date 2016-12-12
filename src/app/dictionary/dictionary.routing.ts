import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { DictionaryComponent } from './dictionary.component'

const dictionaryRoutes: Routes = [
    { path: 'dictionary/:foreign/:base', component: DictionaryComponent }
]

export const dictionaryRouting: ModuleWithProviders = RouterModule.forChild(dictionaryRoutes)
