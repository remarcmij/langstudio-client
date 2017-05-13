import { Routes, RouterModule } from '@angular/router'

import { AdminUserComponent } from './user/admin-user.component'
import { AdminUserDetailComponent } from './user/admin-user-detail.component'
import { FileUploadComponent } from './content/file-upload/file-upload.component'
import { AdminLibraryComponent } from './content/admin-library/admin-library.component'
import { AdminPublicationComponent } from './content/admin-publication/admin-publication.component'
import { AuthGuard } from '../core'

const adminRoutes: Routes = [
  { path: 'admin/user/:id', component: AdminUserDetailComponent, canActivate: [AuthGuard] },
  { path: 'admin/user', component: AdminUserComponent, canActivate: [AuthGuard] },
  { path: 'admin/upload', component: FileUploadComponent, canActivate: [AuthGuard] },
  { path: 'admin/library/:publication', component: AdminPublicationComponent, canActivate: [AuthGuard] },
  { path: 'admin/library', component: AdminLibraryComponent, canActivate: [AuthGuard] }
]

export const adminRouting = RouterModule.forChild(adminRoutes)
