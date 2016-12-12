import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FileUploadModule } from 'ng2-file-upload'
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap'

import { SharedModule } from '../shared'
import { AdminComponent } from './admin.component'
import { UserAdminComponent } from './user-admin/user-admin.component'
import { UserAdminItemComponent } from './user-admin/user-admin-item.component'
import { UserAdminAuthComponent } from './user-admin/user-admin-auth.component'
import { UserAdminHttpService } from './user-admin/user-admin-http.service'
import { FileUploadComponent } from './library-admin/file-upload.component'
import { LibraryAdminComponent } from './library-admin/library-admin.component'
import { PublicationManagerComponent } from './library-admin/publication-admin.component'
import { LibraryAdminHttpService } from './library-admin/library-admin-http.service'
import { adminRouting } from './admin.routing'

@NgModule({
    imports: [
        HttpModule,
        FileUploadModule,
        ModalModule,
        adminRouting,
        SharedModule
    ],
    declarations: [
        AdminComponent,
        UserAdminComponent,
        UserAdminItemComponent,
        UserAdminAuthComponent,
        FileUploadComponent,
        LibraryAdminComponent,
        PublicationManagerComponent
    ],
    providers: [
        UserAdminHttpService,
        LibraryAdminHttpService
    ]
})
export class AdminModule { }
