import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FileUploadModule } from 'ng2-file-upload'
import { ModalModule } from 'ngx-bootstrap'

import { SharedModule } from '../shared'
import { AdminComponent } from './admin.component'
import { UserAdminComponent } from './userAdmin/userAdmin.component'
import { UserAdminItemComponent } from './userAdmin/userAdminItem.component'
import { UserAdminAuthComponent } from './userAdmin/userAdminAuth.component'
import { UserAdminHttpService } from './userAdmin/userAdminHttp.service'
import { FileUploadComponent } from './contentAdmin/fileUpload.component'
import { LibraryAdminComponent } from './contentAdmin/libraryAdmin.component'
import { PublicationAdminComponent } from './contentAdmin/publicationAdmin.component'
import { ContentAdminHttpService } from './contentAdmin/contentAdminHttp.service'
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
    PublicationAdminComponent
  ],
  providers: [
    UserAdminHttpService,
    ContentAdminHttpService
  ]
})
export class AdminModule { }
