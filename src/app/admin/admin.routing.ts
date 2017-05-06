import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { UserAdminComponent } from './userAdmin/userAdmin.component'
import { UserAdminAuthComponent } from './userAdmin/userAdminAuth.component'
import { FileUploadComponent } from './contentAdmin/fileUpload.component'
import { LibraryAdminComponent } from './contentAdmin/libraryAdmin.component'
import { PublicationAdminComponent } from './contentAdmin/publicationAdmin.component'
// import { AuthGuard } from '../core'

const adminRoutes: Routes = [
  { path: 'admin/user/:id', component: UserAdminAuthComponent },
  { path: 'admin/user', component: UserAdminComponent },
  { path: 'admin/upload', component: FileUploadComponent },
  { path: 'admin/library/:publication', component: PublicationAdminComponent },
  { path: 'admin/library', component: LibraryAdminComponent }
]

export const adminRouting: ModuleWithProviders = RouterModule.forChild(adminRoutes)
