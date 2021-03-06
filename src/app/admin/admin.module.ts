import { NgModule } from '@angular/core'
import { FileUploadModule } from 'ng2-file-upload'
import { MdDialogModule } from '@angular/material'

import { SharedModule } from '../shared'
import { NavigationModule } from '../navigation/navigation.module'
import { AdminUserComponent } from './user/admin-user.component'
import { AdminUserDetailComponent } from './user/admin-user-detail.component'
import { AdminUserApi } from './user/admin-user-api.service'
import { FileUploadComponent } from './content/file-upload/file-upload.component'
import { AdminLibraryComponent } from './content/admin-library/admin-library.component'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { AdminPublicationComponent } from './content/admin-publication/admin-publication.component'
import { AdminContentApi } from './content/admin-content-api.service'
import { AdminRoutingModule } from './admin-routing.module'

@NgModule({
  imports: [
    FileUploadModule,
    MdDialogModule,
    SharedModule,
    // CommonModule,
    NavigationModule,
    AdminRoutingModule
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
    AdminUserApi,
    AdminContentApi
  ]
})
export class AdminModule { }
