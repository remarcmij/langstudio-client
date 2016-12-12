import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { UserAdminComponent } from './user-admin/user-admin.component'
import { UserAdminAuthComponent } from './user-admin/user-admin-auth.component'
import { FileUploadComponent }  from './library-admin/file-upload.component'
import { LibraryAdminComponent } from './library-admin/library-admin.component'
import { PublicationManagerComponent } from './library-admin/publication-admin.component'
// import { AuthGuard } from '../core'

const adminRoutes: Routes = [
    { path: 'admin/user/:id', component: UserAdminAuthComponent },
    { path: 'admin/user', component: UserAdminComponent },
    { path: 'admin/upload', component: FileUploadComponent },
    { path: 'admin/library/:publication', component: PublicationManagerComponent },
    { path: 'admin/library', component: LibraryAdminComponent }
]

export const adminRouting: ModuleWithProviders = RouterModule.forChild(adminRoutes)
