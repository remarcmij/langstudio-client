import { NgModule } from '@angular/core'
import { HttpModule } from '@angular/http'
import { FileUploadModule } from 'ng2-file-upload'
import { MdDialogModule } from '@angular/material'

import { SharedModule } from '../shared'
import { NavigationModule } from '../navigation/navigation.module'
import { AdminUserComponent } from './user/admin-user.component'
import { AdminUserDetailComponent } from './user/admin-user-detail.component'
import { AdminUserHttp } from './user/admin-user-http.service'
import { FileUploadComponent } from './content/file-upload/file-upload.component'
import { AdminLibraryComponent } from './content/admin-library/admin-library.component'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { AdminPublicationComponent } from './content/admin-publication/admin-publication.component'
import { AdminContentHttp } from './content/admin-content-http.service'
import { adminRouting } from './admin.routing'

@NgModule({
  imports: [
    HttpModule,
    FileUploadModule,
    MdDialogModule,
    SharedModule,
    NavigationModule,
    adminRouting
  ],
  declarations: [
    AdminUserComponent,
    AdminUserDetailComponent,
    FileUploadComponent,
    AdminLibraryComponent,
    AdminPublicationComponent,
    ConfirmDialogComponent
  ],
  entryComponents: [
    ConfirmDialogComponent
  ],
  providers: [
    AdminUserHttp,
    AdminContentHttp
  ]
})
export class AdminModule { }
