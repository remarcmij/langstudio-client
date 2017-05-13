import { Component, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FileUploader } from 'ng2-file-upload'

import { AuthService } from '../../../core'
import { AdminContentHttp } from '../admin-content-http.service'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'my-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnDestroy {
  uploader: FileUploader
  hasBaseDropZoneOver = false
  hasAnotherDropZoneOver = false

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _httpService: AdminContentHttp
  ) {
    this.uploader = new FileUploader({
      url: `${environment.api.host}${environment.api.path}/upload`,
      authToken: 'Bearer ' + this._authService.token,
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
    this._httpService.clearCache()
  }

  onAction(action: string) {
    switch (action) {
      case 'back':
        this._router.navigate(['/library'])
        break
    }
  }
}
