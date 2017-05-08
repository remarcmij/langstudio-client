import { Routes, RouterModule } from '@angular/router'

import { AuthGuard } from './core'
import { AboutComponent } from './about/about.component'
import { AdminComponent } from './admin/admin.component'
import { SignInComponent } from './sign-in/sign-in.component'

const appRoutes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'signin', component: SignInComponent },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: 'library', pathMatch: 'full' },
  { path: '**', redirectTo: 'library' }
]

export const appRoutingProviders: any[] = []

export const routing = RouterModule.forRoot(appRoutes)
