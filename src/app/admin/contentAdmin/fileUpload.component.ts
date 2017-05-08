import { Component, OnDestroy } from '@angular/core'
import { FileUploader } from 'ng2-file-upload'

import { AuthService } from '../../core'
import { ContentAdminHttp } from './contentAdminHttp.service'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'my-file-upload',
  templateUrl: './fileUpload.component.html'
})
export class FileUploadComponent implements OnDestroy {
  uploader: FileUploader
  hasBaseDropZoneOver = false
  hasAnotherDropZoneOver = false

  constructor(
    private authService: AuthService,
    private httpService: ContentAdminHttp
  ) {
    this.uploader = new FileUploader({
      url: `${environment.api.host}${environment.api.path}/upload`,
      authToken: 'Bearer ' + this.authService.token,
      isHTML5: true
    })
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e
  }

  fileOverAnother(e: any) {
    this.hasAnotherDropZoneOver = e
  }

  ngOnDestroy() {
    this.httpService.clearCache()
  }
}
