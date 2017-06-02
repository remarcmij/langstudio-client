import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AuthGuard } from './core'

const appRoutes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  { path: '**', redirectTo: 'library' }
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
