import { Component, OnDestroy } from '@angular/core'
import { FileUploader } from 'ng2-file-upload'

import { AuthService } from '../../core'
import { ContentAdminHttpService } from './contentAdminHttp.service'
import { AppConstants } from '../../app.constants'

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
    private httpService: ContentAdminHttpService
  ) {
    this.uploader = new FileUploader({
      url: AppConstants.apiEndPoint + '/api/upload',
      authToken: 'Bearer ' + this.authService.token,
      isHTML5: true
    })
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e
  }

  fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e
  }

  ngOnDestroy(): void {
    this.httpService.clearCache()
  }
}
