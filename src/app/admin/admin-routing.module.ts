import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AdminUserComponent } from './user/admin-user.component'
import { AdminUserDetailComponent } from './user/admin-user-detail.component'
import { FileUploadComponent } from './content/file-upload/file-upload.component'
import { AdminLibraryComponent } from './content/admin-library/admin-library.component'
import { AdminPublicationComponent } from './content/admin-publication/admin-publication.component'
import { AuthGuard } from '../core'

const adminRoutes: Routes = [
  { path: 'user/:id', component: AdminUserDetailComponent, canActivate: [AuthGuard] },
  { path: 'user', component: AdminUserComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: 'library/:publication', component: AdminPublicationComponent, canActivate: [AuthGuard] },
  { path: 'library', component: AdminLibraryComponent, canActivate: [AuthGuard] }
]

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AdminRoutingModule { }
