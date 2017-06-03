import { NgModule } from '@angular/core'
import { RouterModule, Routes, PreloadAllModules } from '@angular/router'

import { AuthGuard } from './core'

const appRoutes: Routes = [
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  { path: 'search', loadChildren: 'app/search/search.module#SearchModule' },
  { path: 'signin', loadChildren: 'app/sign-in/sign-in.module#SignInModule' },
  { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule', canLoad: [AuthGuard] },
  { path: 'about', loadChildren: 'app/about/about.module#AboutModule' },
  { path: '**', redirectTo: 'library' }
]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
